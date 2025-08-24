
export type Company = { id: number | string; name: string; website?: string | null; createdAt?: string };

const json = async (res: Response) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as any;
};

export const api = {
  async listCompanies(): Promise<Company[]> {
    const res = await fetch("/api/companies", { headers: { Accept: "application/json" } });
    return json(res);
  },
  async createCompany(input: { name: string; website?: string }) : Promise<Company> {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return json(res);
  }
};
