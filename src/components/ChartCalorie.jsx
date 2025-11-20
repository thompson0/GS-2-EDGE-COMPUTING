"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const LASTN = 20;
const REFRESH_MS = 5000;

export default function DeviceHistoryChart({ attr = "sys" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    fetchData();
    const timer = setInterval(fetchData, REFRESH_MS);

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [attr]);

  async function fetchData() {
    setLoading(true);

    try {
      const url = `/api/sth?attr=${attr}&lastN=${LASTN}`;

      const resp = await fetch(url, {
        method: "GET",
        headers: {
          "fiware-service": "smart",
          "fiware-servicepath": "/",
        },
      });

      if (!resp.ok) {
        console.error("Erro ao chamar /api/sth:", await resp.text());
        return;
      }

      const raw = await resp.json();

      let points = [];

      // ===============================
      // LER FORMATO LEGACY DO STH-COMET
      // ===============================
      const ce = raw.contextResponses?.[0]?.contextElement;
      const attrs = ce?.attributes || [];
      const a = attrs.find((x) => x.name === attr);

      if (a && Array.isArray(a.values)) {
        points = a.values.map((v) => ({
          ts: v.recvTime,
          value: Number(v.attrValue),
        }));
      }

      const processed = points
        .map((p) => ({
          ...p,
          displayTs: formatShortTime(p.ts),
        }))
        .filter((p) => !Number.isNaN(p.value));

      if (mounted.current) {
        setData(processed);
      }
    } catch (err) {
      console.error("Erro ao buscar STH:", err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  function formatShortTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR");
  }

  function attrName() {
    if (attr === "sys") return "Pressão Sistólica (SYS)";
    if (attr === "dia") return "Pressão Diastólica (DIA)";
    return attr.toUpperCase();
  }

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h3>📊 Histórico — {attrName()}</h3>

      {loading && <div>Carregando dados...</div>}

      {!loading && data.length === 0 && (
        <div>Nenhum dado recebido ainda do STH-Comet.</div>
      )}

      {data.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayTs" />
              <YAxis />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(value) => [`${value}`, attrName()]}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Bar dataKey="value" name={attrName()} barSize={24} />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 16 }}>
            <h4>Últimos {data.length} valores</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ddd" }}>Horário</th>
                  <th style={{ borderBottom: "1px solid #ddd" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={i}>
                    <td>{p.displayTs}</td>
                    <td>{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
