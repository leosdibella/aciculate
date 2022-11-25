import { IStackItem, IVertex } from '../interfaces';
import { ObstinateError } from './obstinate-error';
import { ObstinateErrorCode } from '../enums';

export class DirectedAcyclicGraph<T = unknown> {
  readonly #allowDuplicateVertexValues: boolean = false;
  readonly #shouldVerify: boolean = false;
  readonly #edges: number[][] = [];
  readonly #vertices: Readonly<IVertex<T>>[] = [];
  readonly #vertexToString: (vertex: T) => string;
  readonly #areEqualVertices: (vertex1: T, vertex2: T) => boolean;
  #topologicallySorted: Readonly<T[]> = [];

  #topologicalSort() {
    let next: number | undefined;
    let last: IStackItem;
    let stack: IStackItem[];
    const visitedVertices = [...Array(this.#vertices.length)].map(() => false);
    const topologicallySorted: T[] = [];

    for (let i = 0; i < this.#vertices.length; ++i) {
      if (!visitedVertices[i]) {
        stack = [
          {
            vertexIndex: i,
            edgeIndex: 0
          }
        ];

        while (stack.length > 0) {
          last = stack[stack.length - 1];
          next = this.#edges[last.vertexIndex][last.edgeIndex];

          if (visitedVertices[next]) {
            ++last.edgeIndex;
          } else if (next === undefined) {
            if (!visitedVertices[last.vertexIndex]) {
              visitedVertices[last.vertexIndex] = true;
              topologicallySorted.push(this.#vertices[last.vertexIndex].value);
            }

            stack.pop();
          } else {
            stack.push({
              vertexIndex: next,
              edgeIndex: 0
            });
          }
        }
      }
    }

    this.#topologicallySorted = Object.freeze<T[]>(topologicallySorted);
  }

  #verify(startingVertexIndex: number) {
    let currentVisitingIndex = 0;

    const visitedVertexIndices: Record<number, number> = {
      [startingVertexIndex]: currentVisitingIndex
    };

    const edges = [...this.#edges[startingVertexIndex]];

    while (edges.length) {
      const vertexIndex = edges.pop()!;

      if (visitedVertexIndices[vertexIndex] !== undefined) {
        const circularDependency = [
          ...Object.keys(visitedVertexIndices)
            .map((k) => +k)
            .sort((a, b) =>
              visitedVertexIndices[a] > visitedVertexIndices[b] ? 1 : -1
            ),
          startingVertexIndex
        ]
          .map((vi) => this.#vertexToString(this.#vertices[vi].value))
          .join(' -> ');

        throw new ObstinateError(
          ObstinateErrorCode.circularDependency,
          `Circular dependency detected: ${circularDependency}`
        );
      } else {
        visitedVertexIndices[vertexIndex] = ++currentVisitingIndex;

        this.#edges[vertexIndex].forEach((vertex) => {
          edges.push(vertex);
        });
      }
    }
  }

  #addVertex(value: T) {
    if (!this.#allowDuplicateVertexValues) {
      const existingIndex = this.#vertices.findIndex((vertex) =>
        this.#areEqualVertices(vertex.value, value)
      );

      if (existingIndex > -1) {
        return existingIndex;
      }
    }

    this.#vertices.push(
      Object.freeze<IVertex<T>>({
        index: this.#vertices.length,
        value
      })
    );

    this.#edges.push([]);

    return this.#vertices.length - 1;
  }

  public get vertices() {
    return [...this.#vertices];
  }

  public get edges(): Readonly<Readonly<number[]>[]> {
    return Object.freeze<Readonly<number[]>>(
      this.#edges.map((edges) => Object.freeze([...edges]))
    );
  }

  public get topologicallySorted() {
    if (!this.#topologicallySorted.length) {
      this.#topologicalSort();
    }

    return [...this.#topologicallySorted];
  }

  public addEdge(fromVertexIndex: number, toVertexIndex: number) {
    const hasExistingEdge =
      this.#edges[fromVertexIndex].indexOf(toVertexIndex) > -1;

    if (!hasExistingEdge) {
      this.#edges[fromVertexIndex].push(toVertexIndex);
      this.#topologicallySorted = [];

      if (this.#shouldVerify) {
        this.#verify(fromVertexIndex);
      }
    }
  }

  public addVertices(values: T[]) {
    values.forEach((value) => {
      this.#addVertex(value);
    });

    this.#topologicallySorted = [];
  }

  public addVertex(value: T) {
    const vertexIndex = this.#addVertex(value);
    this.#topologicallySorted = [];

    return vertexIndex;
  }

  public constructor(parameters: {
    shouldVerify?: boolean;
    vertexToString?(vertex: T): string;
    allowDuplicateVertexValues?: boolean;
    areEqualVertices?(vertex1: T, vertex2: T): boolean;
  }) {
    this.#shouldVerify = parameters.shouldVerify ?? false;

    this.#allowDuplicateVertexValues =
      parameters.allowDuplicateVertexValues ?? false;

    this.#vertexToString =
      parameters.vertexToString ?? ((vertex: T) => `${vertex}`);

    this.#areEqualVertices =
      parameters.areEqualVertices ??
      ((vertex1: T, vertex2: T) => vertex1 === vertex2);
  }
}
