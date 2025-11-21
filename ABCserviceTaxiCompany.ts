import * as fs from "fs";

type SingleNumberProperty = {
  [key: string]: number;
};
type typeGraph = "directed" | "undirected";
type typeGraphArg = Map<number, string[][]>;

class Graph {
  public typeGraph: typeGraph;
  public filedata: typeGraphArg;
  public size() {
    return this.filedata.size;
  }
  public weight(v1: number, v2: number): number | null {
    const adjacentVertex = [this.filedata.get(v1), this.filedata.get(v2)]; // ([string, string][] | undefined)[]

    if (adjacentVertex[0]) {
      for (const edge of adjacentVertex[0]) {
        const Vertex: number = Number(edge[0]);
        if (Vertex == v2) {
          return Number(edge[1]);
        }
      }
    }
    if (this.typeGraph === "undirected" && adjacentVertex[1]) {
      for (const edge of adjacentVertex[1]) {
        const Vertex: number = Number(edge[0]);
        if (Vertex == v1) {
          return Number(edge[1]);
        }
      }
    }

    return null;
  }

  public is_edge(v1: number, v2: number): boolean {
    const v1Neighbors = this.filedata.get(v1) || [];
    for (const edge of v1Neighbors) {
      if (Number(edge[0]) === v2) {
        return true;
      }
    }
    if (this.typeGraph === "undirected") {
      const v2Neighbors = this.filedata.get(v2) || [];
      for (const edge of v2Neighbors) {
        if (Number(edge[0]) === v1) {
          return true;
        }
      }
    }
    return false;
  }
  public rm_edge(v1: number, v2: number): void {
    const edgeVertex = this.filedata.get(v1);
    if (edgeVertex) {
      for (let i = edgeVertex.length - 1; i >= 0; i--) {
        if (Number(edgeVertex[i][0]) === v2) {
          edgeVertex.splice(i, 1);
        }
      }
    }
    if (this.typeGraph === "undirected") {
      const edgeVertex2 = this.filedata.get(v2);
      if (edgeVertex2) {
        for (let i = edgeVertex2.length - 1; i >= 0; i--) {
          if (Number(edgeVertex2[i][0]) === v1) {
            edgeVertex2.splice(i, 1);
          }
        }
      }
    }
  }

  public add_vertex(v1: number): void {
    if (!this.filedata.has(v1)) {
      this.filedata.set(v1, []);
    }
    console.log("This vertex is already there ");
  }
  public add_edge(v1: number, v2: number, weight: number): void {
    if (this.is_edge(v1, v2)) {
      throw new Error("This edge is already there");
    }
    const oldEdges = this.filedata.get(v1) || [];
    this.filedata.set(v1, [...oldEdges, [v2.toString(), weight.toString()]]);
  }

  public list_of_edges(vertex?: number) {
    const edgeList: { from: string; to: string; weight: number }[] = [];
    for (let edges of this.filedata) {
      for (let i = 0; i < edges[1].length; i++) {
        edgeList.push({
          from: edges[0].toString(),
          to: edges[1][i][0].toString(),
          weight: Number(edges[1][i][1]),
        });
      }
    }
    let resultList = edgeList;
    if (this.typeGraph === "undirected") {
      const uniqueEdges = new Map<
        string,
        { from: string; to: string; weight: number }
      >();
      for (let edge of edgeList) {
        const key = `${Math.min(Number(edge.from), Number(edge.to))}-${Math.max(Number(edge.from), Number(edge.to))}`;
        if (!uniqueEdges.has(key)) {
          uniqueEdges.set(key, {
            from: edge.from,
            to: edge.to,
            weight: edge.weight,
          });
        }
      }

      resultList = Array.from(uniqueEdges.values());
    }
    if (vertex !== undefined) {
      const vertexStr = vertex.toString();
      return resultList.filter(
        (edge) => edge.from === vertexStr || edge.to === vertexStr,
      );
    }
    return resultList;
  }

  private readfiles(path: string) {
    return fs.readFileSync(path, "utf-8");
  }

  public readfile(path: string) {
    const content = this.readfiles(path)
      .split("\n")
      .map((line) => line.trim());
    const weightgraph = new Map();
    for (let i = 1; i < content.length - 1; i++) {
      const lineParts = content[i].split(" ");
      const parsedLine = [];
      for (let j = 0; j < lineParts.length; j++) {
        if (lineParts[j] === "") break;
        parsedLine.push(lineParts[j].split(":"));
      }
      weightgraph.set(i, parsedLine);
    }
    this.filedata = weightgraph;
    return weightgraph;
  }
  constructor(graph?: Graph, tGraph: typeGraph = "directed") {
    this.filedata = new Map();
    this.typeGraph = tGraph;
    if (graph instanceof Graph) {
      graph.filedata.forEach((value: string[][], key: number) => {
        const copiedEdges = value.map((edge) => [...edge]);
        this.filedata.set(key, copiedEdges);
      });
    }
  }
}

function Dijkstra(star: number, graph: typeGraphArg): [SingleNumberProperty, Map<number, number[]>] {
  let d: SingleNumberProperty = {};
  let parent = new Map<number, number[]>();
  let visited: { [key: string]: boolean } = {};

  for (let vertex of graph.keys()) {
    d[vertex.toString()] = Infinity;
    parent.set(vertex, [])
  }
  d[star.toString()] = 0;
  parent.set(star, [star])
  let numVisited = 0;
  while (numVisited < graph.size) {
    let minDist = Infinity;
    let currentVertexStr: string | null = null;
    for (let vertex of graph.keys()) {
      let vStr = vertex.toString();
      if (!visited[vStr] && d[vStr] < minDist) {
        minDist = d[vStr];
        currentVertexStr = vStr;
      }
    }
    if (currentVertexStr === null) break;

    let current = Number(currentVertexStr);
    visited[currentVertexStr] = true;
    numVisited++;
    const listweight = graph.get(current);
    if (listweight) {
      for (let j = 0; j < listweight.length; j++) {
        const a: string[] = listweight[j];
        const neighbor = a[0];
        const weight = Number(a[1]);

        let newDist = d[currentVertexStr] + weight;
        if (newDist < d[neighbor]) {
          d[neighbor] = newDist;
          const currParent = parent.get(current) || [];
          parent.set(Number(neighbor), [...currParent, Number(neighbor)]);
        }
      }
    } else {
      console.warn(`There are no neighbors for the vertex ${current}`);
    }
  }
  return [d, parent];
}



function getPriceInYear(price: number, year: number, devalvationPrice: number): number {
  if (year == 1) { return price };
  return price * ((1 + devalvationPrice) ** (year - 1))
}
function getDepreciatedValue(price: number, year: number, devalvationPrice: Map<number, number>) {
  let currentValue = price;
  for (let k = 1; k <= year; k++) {
    currentValue = currentValue * (1 - (devalvationPrice.get(k) || 1));
  }
  return currentValue
}
/**
 *
 * @param {number} price - Цена авто
 * @param {number[]} maintenanceCosts - Цена обслуживание по годам
 * @param {number} depreciationRates - Коэффициенты амортизации
 * @param {number} inflationRate - Инфляция
 */
function generateGraph(price: number, maintenanceCosts: number[], depreciationRates: Map<number, number>, inflationRate: number): Graph {
  let graph = new Graph();
  for (let i = 1; i <= maintenanceCosts.length; i++) {
    let buyThisYear = Math.floor(getPriceInYear(price, i, inflationRate));
    graph.add_vertex(i)
    let k = i + 1
    for (let j = k; j <= maintenanceCosts.length; j++) {
      let repairPrice = maintenanceCosts.reduce((accum, el, idx) => idx < j - i ? accum + el : accum, 0);
      // console.log(buyThisYear, repair, Math.floor(thisYearPrice(price, j, devalPrice)));
      let weight = (buyThisYear + repairPrice) - Math.floor(getDepreciatedValue(buyThisYear, j - i, depreciationRates));
      graph.add_edge(i, j, weight)
    }
  }
  return graph
}


let a = new Map<number, number>([
  [1, 0.25],
  [2, 0.25],
  [3, 0.15],
  [4, 0.15],
  [5, 0.15],
  [6, 0.15],
  [7, 0.15],
  [8, 0.15],
  [9, 0.15],
  [10, 0.15],
]);

let gr = generateGraph(7000, [1200, 1500, 1900, 2400, 3000, 3700, 4500, 5400, 6400, 7500], a, 0.10);
console.log(gr.filedata)
console.log(Dijkstra(1, gr.filedata))
