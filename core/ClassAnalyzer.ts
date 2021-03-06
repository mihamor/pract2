import ClassNode from "./ClassNode";
import { ClassMap } from "./types";

export default class ClassAnalyzer {
  head: ClassNode;
  classMap: ClassMap;
  numOfChildren: number;
  totalMIF: number;
  totalAIF: number;
  totalMHF: number;
  totalAHF: number;
  totalPOF: number;

  constructor(instance: any, key: string) {
    this.head = new ClassNode(instance, key);
    this.classMap = {};
    this.numOfChildren = 0;
    this.totalAIF = 0;
    this.totalMIF = 0;
    this.totalMHF = 0;
    this.totalAHF = 0;
    this.totalPOF = 0;
  }

  static calcFieldsAndMethods (node: ClassNode) {
    const totalKeys = Object.keys(node.instance);
    const totalMethods = totalKeys.filter((key) => typeof node.instance[key] === 'function');
    const totalFields = totalKeys.length - totalMethods.length;
    const hiddenFields = Object.getOwnPropertyNames(node.instance).filter((key => !totalKeys.some((field) => key === field))).length;
    const hiddenMethods = Object.getOwnPropertyNames(node.instance).filter((key => !totalMethods.some((field) => key === field))).length;
  
    const proto  = Object.getOwnPropertyNames(Object.getPrototypeOf(node.instance) || {});
    const ownFields = Object.getOwnPropertyNames(node.instance).filter((key) => !proto.some(protoKey => protoKey === key)).length;

    return {
      hiddenMethods,
      hiddenFields,
      fields: totalFields,
      methods: totalMethods.length,
      ownFields,
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
    this.totalMIF += ownCalc.methods ? childCalc.methods / ownCalc.methods : 0;
    this.totalAIF += ownCalc.fields ? childCalc.fields / ownCalc.fields : 0;
    this.totalMHF += ownCalc.hiddenMethods ? childCalc.hiddenMethods / ownCalc.hiddenMethods : 0;
    this.totalAHF += ownCalc.hiddenFields ? childCalc.hiddenFields / ownCalc.hiddenFields : 0;
    this.totalPOF += ownCalc.ownFields ? childCalc.ownFields / ownCalc.ownFields : 0;

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

  public getAHF() {
    return this.totalAHF;
  }

  public getMHF() {
    return this.totalMHF;
  }

  public getPOF() {
    return this.totalPOF;
  }


  static printNodeWithChildren (node: ClassNode, level: number) {
    console.log(`${' '.repeat(level * 2)} ${node.key}`)
    if (!node.children.length) return;
    node.children.forEach(child => ClassAnalyzer.printNodeWithChildren(child, level + 1))
  }
}
