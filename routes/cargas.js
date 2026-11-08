import express from "express";
import pool from "../db.js";
import { normalizarPais } from "../utils/normalizar.js";

const router = express.Router();

// LISTAR
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM cargas ORDER BY data_carregamento DESC, hora_carregamento DESC",
    );
    res.render("index", { cargas: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar dados: " + err.message);
  }
});

// FORM NOVO
router.get("/nova", (req, res) => {
  res.render("form", { carga: null, erro: null });
});

// CRIAR
router.post("/", async (req, res) => {
  const {
    data_carregamento,
    hora_carregamento,
    cidade_origem,
    data_entrega,
    hora_entrega,
    cidade_destino,
    observacoes,
  } = req.body;

  const pais_origem = normalizarPais(req.body.pais_origem);
  const pais_destino = normalizarPais(req.body.pais_destino);

  try {
    await pool.query(
      `INSERT INTO cargas
       (data_carregamento, hora_carregamento, cidade_origem, pais_origem,
        data_entrega, hora_entrega, cidade_destino, pais_destino, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        data_carregamento,
        hora_carregamento,
        cidade_origem,
        pais_origem,
        data_entrega,
        hora_entrega,
        cidade_destino,
        pais_destino,
        observacoes,
      ],
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("form", { carga: req.body, erro: "Erro: " + err.message });
  }
});

// FORM EDITAR
router.get("/:id/editar", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM cargas WHERE id = $1", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).send("Carga não encontrada");
    res.render("edit", { carga: rows[0], erro: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro");
  }
});

// ATUALIZAR
router.put("/:id", async (req, res) => {
  const {
    data_carregamento,
    hora_carregamento,
    cidade_origem,
    data_entrega,
    hora_entrega,
    cidade_destino,
    observacoes,
  } = req.body;

  const pais_origem = normalizarPais(req.body.pais_origem);
  const pais_destino = normalizarPais(req.body.pais_destino);

  try {
    await pool.query(
      `UPDATE cargas SET
        data_carregamento=$1, hora_carregamento=$2,
        cidade_origem=$3, pais_origem=$4,
        data_entrega=$5, hora_entrega=$6,
        cidade_destino=$7, pais_destino=$8,
        observacoes=$9
       WHERE id=$10`,
      [
        data_carregamento,
        hora_carregamento,
        cidade_origem,
        pais_origem,
        data_entrega,
        hora_entrega,
        cidade_destino,
        pais_destino,
        observacoes,
        req.params.id,
      ],
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("edit", {
      carga: { ...req.body, id: req.params.id },
      erro: "Erro: " + err.message,
    });
  }
});

// PÁGINA DE IMPRESSÃO
// PÁGINA DE IMPRESSÃO (com filtro por mês)
router.get("/imprimir", async (req, res) => {
  const { mes } = req.query; // Ex: '2026-07' ou undefined

  try {
    let query = "SELECT * FROM cargas";
    let params = [];

    if (mes) {
      // Filtra pelo mês e ano (ex: data_carregamento LIKE '2026-07%')
      query += " WHERE TO_CHAR(data_carregamento, 'YYYY-MM') = $1";
      params.push(mes);
    }

    query += " ORDER BY data_carregamento ASC, hora_carregamento ASC";

    const { rows } = await pool.query(query, params);

    // Formatar o nome do mês para mostrar no PDF (Ex: Julho de 2026)
    let tituloMes = "Todas as Viagens";
    if (mes) {
      const [ano, mesNum] = mes.split("-");
      const dataObj = new Date(ano, mesNum - 1, 1);
      tituloMes = dataObj.toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      });
      tituloMes = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1); // Capitalizar
    }

    res.render("imprimir", { cargas: rows, tituloMes });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar dados: " + err.message);
  }
});

// APAGAR
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM cargas WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao apagar");
  }
});

export default router;
