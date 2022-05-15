import * as React from 'react';
import * as https from 'https';

import ClassAnalyzer from './core/ClassAnalyzer';

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