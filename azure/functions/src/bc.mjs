// Calls the Business Central API with the Entra app's client credentials (secret from Key Vault via the app setting).
export function bcFetcher(env = process.env) {
  const { BC_TENANT, BC_ENVIRONMENT, BC_COMPANY, BC_CLIENT_ID, BC_CLIENT_SECRET } = env;
  if (!BC_CLIENT_ID || !BC_CLIENT_SECRET) return null;
  const base = `https://api.businesscentral.dynamics.com/v2.0/${BC_TENANT}/${BC_ENVIRONMENT}/api`;
  let token, companyId;
  const auth = async () => {
    if (token) return token;
    const res = await fetch(`https://login.microsoftonline.com/${BC_TENANT}/oauth2/v2.0/token`, {
      method: "POST",
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: BC_CLIENT_ID, client_secret: BC_CLIENT_SECRET, scope: "https://api.businesscentral.dynamics.com/.default" }),
    });
    const json = await res.json();
    if (!json.access_token) throw new Error(`BC token: ${json.error ?? res.status}`);
    return (token = json.access_token);
  };
  const get = async (url) => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${await auth()}` } });
    if (!res.ok) throw new Error(`BC API ${res.status}`);
    return res.json();
  };
  return async (path) => {
    if (path.startsWith("https://")) return get(path);
    if (!companyId) {
      const companies = await get(`${base}/v2.0/companies?$filter=name eq '${BC_COMPANY}'`);
      companyId = companies.value[0]?.id;
      if (!companyId) throw new Error(`BC company ${BC_COMPANY} not found`);
    }
    return get(`${base}/kalvaert/implementation/v1.0/companies(${companyId})/${path}`);
  };
}
