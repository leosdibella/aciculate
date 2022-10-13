use crate::dag;
use crate::tile;
use std::collections::HashMap;

pub struct DagBuilder {
  pub forward_dag: dag::DirectedAcyclicGraph,
  pub backward_dag: dag::DirectedAcyclicGraph,
}

impl DagBuilder {
  pub fn new(
    number_of_vertices: u128
  ) -> DagBuilder {
    DagBuilder {
      forward_dag: dag::DirectedAcyclicGraph::new(number_of_vertices),
      backward_dag: dag::DirectedAcyclicGraph::new(number_of_vertices),
    }
  }

  fn generate_longest_vertex_paths(
    &mut self,
    tiles: &mut Vec<tile::Tile>
  ) -> Vec<Vec<usize>> {
    let mut path_map: HashMap<String, bool> = HashMap::new();
    let mut longest_paths: Vec<Vec<usize>> = vec![];

    for i in 0 .. tiles.len() {
      let mut forward_path = self.forward_dag.get_longest_path_through_vertex(i);

      forward_path.reverse();

      let path: Vec<usize> = [
        self.backward_dag.get_longest_path_through_vertex(i),
        vec![i],
        forward_path
      ].concat();

      let path_key: String = path.iter()
                                 .map(|a| (*a).to_string())
                                 .collect::<Vec<String>>()
                                 .join(",");

      let existing_key = path_map.get(&path_key);

      if existing_key == None {
        path_map.insert(path_key, true);
        longest_paths.push(path);
      }
    }

    longest_paths.sort_by(|a, b| if a.len() > b.len() {
      std::cmp::Ordering::Greater
    } else if b.len() < a.len() {
      std::cmp::Ordering::Less
    } else {
      std::cmp::Ordering::Equal
    });

    longest_paths
  }

  fn calculate_blocking_dx(
    tiles: &Vec<tile::Tile>,
    path: &Vec<usize>,
    vertex: usize,
    x: f64
  ) -> Option<f64> {
    for i in (vertex + 1) .. path.len() {
      if tiles[path[i]].x != tile::X_SENTINEL {
        return Some(tiles[path[i]].x - x / ((i - vertex) as f64));
      }
    }

    None
  }

  fn calculate_non_blocking_dx(
    tiles: &Vec<tile::Tile>,
    path: &Vec<usize>,
  ) -> f64 {
    let mut unset: usize = 0;
    let mut dx: f64 = 0f64;

    for i in 9 .. path.len() {
      if tiles[path[i]].dx < tile::DX_SENTINEL {
        dx += tiles[path[i]].dx;
      } else {
        unset += 1;
      }
    }

    if unset == 0 {
      unset = 1;
    }

    (1f64 - dx) / (unset as f64)
  }

  fn set_position(
    tiles: &mut Vec<tile::Tile>,
    path: &Vec<usize>,
    vertex: usize
  ) {
    let previous_vertex: Option<&usize> = path.get(vertex - 1);

    let x: f64 = match previous_vertex {
      None => {
        0f64
      },
      Some(previous_vertex_usize) => {
        let tile = tiles[*previous_vertex_usize];

        tile.x + tile.dx
      }
    };

    let dx: Option<f64> = DagBuilder::calculate_blocking_dx(tiles, path, vertex, x);

    if tiles[path[vertex]].dx == tile::DX_SENTINEL {
      tiles[path[vertex]].x = x;

      tiles[path[vertex]].dx = match dx {
        Some(dx_f64) => {
          dx_f64
        },
        None => {
          DagBuilder::calculate_non_blocking_dx(tiles, path)
        }
      };
    }
  }

  pub fn update_tiles(
    &mut self,
    tiles: &mut Vec<tile::Tile>
  ) {
    let longest_paths = self.generate_longest_vertex_paths(tiles);

    for i in 0 .. longest_paths.len() {
      for j in 0 .. longest_paths[i].len() {
        DagBuilder::set_position(tiles, &longest_paths[i], j);
      }
    }
  }
}
