import * as React from 'react';
import * as https from 'https';

type ClassMap =  {
  [name: string]: {

  },
}

interface IClassNode {
  key: string,
  instance: any
  children: ClassNode[]
};

class ClassNode implements IClassNode {
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


class ClassAnalyzer {
  head: ClassNode;
  classMap: ClassMap;
  numOfChildren: number;
  totalMIF: number;
  totalAIF: number;
  

  constructor(instance: any, key: string) {
    this.head = new ClassNode(instance, key);
    this.classMap = {};
    this.numOfChildren = 0;
    this.totalAIF = 0;
    this.totalMIF = 0;
  }



  static calcFieldsAndMethods (node: ClassNode) {
    const totalKeys = Object.keys(node.instance);;
    const totalMethods = totalKeys.filter((key) => typeof node.instance[key] === 'function');
    const totalFields = totalKeys.length - totalMethods.length;

    return {
      fields: totalFields,
      methods: totalMethods.length,
    };
  }

  public buildTree() {
    const props = ["Component", "PureComponent"];

    Object.keys(this.head.instance).map((key) => {
      const property = this.head.instance[key];
      if (typeof property === 'object'
        || typeof property === 'symbol'
        || props.some(p => p === key)) {

        const child = new ClassNode(property, key);
        this.head.addChild(child);
        this.numOfChildren++;
       
        this.recurAddChildren(child);
      }
    })
  }

  public recurAddChildren(node: ClassNode) {
    const __proto__  = Object.getPrototypeOf(node.instance);

    if (__proto__ === null || __proto__ === undefined) return;

    const newChild = new ClassNode(__proto__, __proto__.constructor.name);
    const ownCalc = ClassAnalyzer.calcFieldsAndMethods(node);
    const childCalc = ClassAnalyzer.calcFieldsAndMethods(newChild);
    const MIF = ownCalc.methods ? childCalc.methods / ownCalc.methods : 0;
    const AIF = ownCalc.fields ? childCalc.fields / ownCalc.fields : 0;
    this.totalAIF = this.totalAIF + AIF;
    this.totalMIF = this.totalMIF + MIF;

    node.addChild(newChild);
    this.numOfChildren++;
    return this.recurAddChildren(newChild);
  }

  public printTree() {
    ClassAnalyzer.printNodeWithChildren(this.head, 0)
  }

  public getNOC() {
    return this.numOfChildren;
  }

  public getAIF() {
    return this.totalAIF;
  }

  public getMIF() {
    return this.totalMIF;
  }

  static printNodeWithChildren (node: ClassNode, level: number) {
    console.log(`${' '.repeat(level * 2)} ${node.key}`)
    if (!node.children.length) return;
    node.children.forEach(child => ClassAnalyzer.printNodeWithChildren(child, level + 1))
  }
}


const prettyPrint = (analyzer: ClassAnalyzer) => {
  analyzer.buildTree();
  analyzer.printTree();
  console.log('Number of children: ', analyzer.getNOC())
  console.log('AIF: ', analyzer.getAIF())
  console.log('MIF: ', analyzer.getMIF())
}

const reactAnalysis = new ClassAnalyzer(React, "React lib");
const httpsAnalysis = new ClassAnalyzer(https, "https");

prettyPrint(reactAnalysis);
prettyPrint(httpsAnalysis);