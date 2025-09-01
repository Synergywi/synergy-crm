export type Contact = {
  id: string;
  givenName: string;
  surname: string;
  email?: string;
  companyId?: string;
};

export type Company = {
  id: string;
  name: string;
  domain?: string;
};
