import axios from 'axios';
type CountryListResponse = {
  mtype?: string;
  list?: { id: string; name: string; isdCode: string }[];
};

export type CountryOption = { code: string; dial: string; name: string };
export async function getCountryList(baseURL: string): Promise<CountryOption[]> {
  const { data } = await axios.post<CountryListResponse>(`${baseURL}/auth/country-list`, {});
  return data?.list?.map((c) => ({ code: c.id, dial: c.isdCode, name: c.name })) ?? [];
}
