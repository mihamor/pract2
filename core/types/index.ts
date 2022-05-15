export type ClassMap =  {
  [name: string]: {

  },
}

export interface IClassNode {
  key: string,
  instance: any
  children: IClassNode[]
};
