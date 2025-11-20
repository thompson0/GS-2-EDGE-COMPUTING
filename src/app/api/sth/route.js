// app/api/sth/route.js

const STH_HOST = "u0wskv8jt.localto.net";  // Host LocalToNet
const STH_PORT = 6047;                     // Porta LocalToNet

const FIWARE_SERVICE = "smart";
const FIWARE_SSP = "/";
const ENTITY_TYPE = "Device";
const ENTITY_ID = "urn:ngsi-ld:Device:001";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const attr = searchParams.get("attr") || "sys";
  const lastN = searchParams.get("lastN") || "20";

  const sthUrl = `http://${STH_HOST}:${STH_PORT}/STH/v1/contextEntities/type/${ENTITY_TYPE}/id/${encodeURIComponent(
    ENTITY_ID
  )}/attributes/${encodeURIComponent(attr)}?lastN=${lastN}`;

  console.log("🔎 Consultando STH:", sthUrl);

  try {
    const resp = await fetch(sthUrl, {
      headers: {
        "fiware-service": FIWARE_SERVICE,
        "fiware-servicepath": FIWARE_SSP,
        Accept: "application/json",
      },
    });

    const body = await resp.text();

    return new Response(body, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("❌ ERRO NA API /api/sth =>", err);

    return new Response(
      JSON.stringify({
        error: "Falha ao conectar ao STH-Comet",
        details: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
