import { IClassNode } from "./types";

export default class ClassNode implements IClassNode {
  key: string;
  instance: any;
  children: ClassNode[];

  constructor(instance: any, key: string) {
    this.instance = instance;
    this.children = [];
    this.key = key;
  }

  public addChild(child: ClassNode) {
    this.children.push(child);
  }
}

