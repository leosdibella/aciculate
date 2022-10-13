pub struct DirectedAcyclicGraph {
  edges: Vec<Vec<usize>>,
  sorted_vertices: Vec<usize>,
}

struct DagStackItem {
  vertex: usize,
  edge: usize,
}

impl DirectedAcyclicGraph {
  pub fn topological_sort(
    &mut self
  ) {
    let mut last_stack_item: &mut DagStackItem;
    let mut visited_vertices: Vec<bool> = self.edges.iter().map(|_| false).collect();

    self.sorted_vertices = vec![];

    for i in 0 .. self.edges.len() {
      if visited_vertices[i] {
        continue;
      }

      let mut stack: Vec<DagStackItem> = vec![
        DagStackItem {
          vertex: i,
          edge: 0
        }
      ];

      while stack.len() > 0 {
        let stack_length = stack.len();
        last_stack_item = &mut stack[stack_length - 1];

        match self.edges[last_stack_item.vertex].get(last_stack_item.edge) {
          Some(next_edge) => {
            if visited_vertices[*next_edge] {
              last_stack_item.edge += 1;
            } else {
              stack.push(DagStackItem {
                vertex: *next_edge,
                edge: 0
              });
            }
          },
          None => {
            if !visited_vertices[last_stack_item.vertex] {
              visited_vertices[last_stack_item.vertex] = true;
              self.sorted_vertices.push(last_stack_item.vertex);
            }

            stack.pop();
          }
        }
      }
    }
  }

  pub fn add_edge(
    &mut self,
    from_vertex: usize,
    to_vertex: usize
  ) -> bool {
    if from_vertex >= self.edges.len()
      || to_vertex >= self.edges.len()
      || self.edges[from_vertex].iter().any(|vertex| *vertex == to_vertex)
      || self.edges[to_vertex].iter().any(|vertex| *vertex == from_vertex) {
      return false;
    }
    
    self.edges[from_vertex].push(to_vertex);

    return true;
  } 

  pub fn new(
    number_of_vertices: u128
  ) -> DirectedAcyclicGraph {
    let edges: Vec<Vec<usize>> = vec![vec![]; number_of_vertices as usize];

    DirectedAcyclicGraph {
      edges,
      sorted_vertices: vec![]
    }
  }

  fn build_paths_through_vertex(
    &mut self,
    vertex: usize,
    vertices: &mut Vec<Option<usize>>
  ) -> Vec<Option<usize>> {
    let mut paths: Vec<Option<usize>> = vec![None; self.edges.len()];

    self.topological_sort();
    
    paths[vertex] = Some(0);

    for i in (0 .. self.sorted_vertices.len()).rev() {
      let from_vertex = self.sorted_vertices[i];

      if let Some(paths_from_vertex) = paths[from_vertex] {
        for j in 0 .. self.edges[from_vertex].len() {
          let mut set_path_and_vertex = false;  
          let to_vertex = self.edges[from_vertex][j];      

          match paths[to_vertex] {
            Some(paths_to_vertex) => {
              if paths_to_vertex <= paths_from_vertex {
                set_path_and_vertex = true;
              }
            },
            None => {
              set_path_and_vertex = true;
            }
          }

          if set_path_and_vertex {
            paths[to_vertex].replace(paths_from_vertex + 1);
            vertices[to_vertex].replace(from_vertex);
          }
        }
      }
    }

    paths
  }

  pub fn get_longest_path_through_vertex(
    &mut self,
    vertex: usize
  ) -> Vec<usize> {
    let mut longest_path: Vec<usize> = vec![];
    let mut longest_path_length: usize = 0;
    let mut longest_path_index: Option<usize> = None;
    let mut vertices: Vec<Option<usize>> = vec![];
    let paths = self.build_paths_through_vertex(vertex, &mut vertices);

    for i in (0 .. self.edges.len()).rev() {
      if let Some(path_length) = paths[i] {
        if path_length >= longest_path_length {
          longest_path_length = path_length;
          longest_path_index.replace(i);
        }
      }
    }

    if let Some(longest_path_index_usize) = longest_path_index {
      longest_path.push(longest_path_index_usize);

      for _j in 0 .. longest_path_length {
        if let Some(longest_vertix_length) = vertices[longest_path_index_usize] {
          longest_path.push(longest_vertix_length);
          longest_path_index.replace(longest_vertix_length);
        }
      }
    }

    longest_path.pop();

    longest_path
  }
}
