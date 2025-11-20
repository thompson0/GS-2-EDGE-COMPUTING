import https from "https";

// ⚠️ GAMBIARRA GLOBAL — desativa validação SSL no Node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const attr = searchParams.get("attr") || "sys";
    const lastN = searchParams.get("lastN") || 20;

    // LocalToNet HTTPS
    const STH_BASE = "https://9ybcg4xpp.localto.net";

    const url = `${STH_BASE}/STH/v1/contextEntities/type/Device/id/Sensor001/attributes/${attr}?lastN=${lastN}`;

    // ⚠️ GAMBIARRA — agente HTTPS ignorando certificado
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "fiware-service": "smart",
        "fiware-servicepath": "/",
      },
      agent,
      cache: "no-store",
    });

    if (!resp.ok) {
      return Response.json(
        { error: "Erro STH", status: resp.status },
        { status: resp.status }
      );
    }

    const raw = await resp.json();
    return Response.json(raw);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
