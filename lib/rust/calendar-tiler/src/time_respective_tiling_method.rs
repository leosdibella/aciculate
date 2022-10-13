use crate::sorted_event;
use crate::tile;
use crate::tiling_method;
use crate::tiler_options;
use crate::dag_builder;

struct Alignment {
  front: Vec<Vec<usize>>,
  back: Vec<Vec<usize>>,
  reduced_back: Vec<Option<Vec<usize>>>,
  reduced_front: Vec<Vec<usize>>
}

impl Alignment {
  fn new(
    number_of_events: usize
  ) -> Alignment {
    Alignment {
      front: vec![Vec::new(); number_of_events],
      back: vec![Vec::new(); number_of_events],
      reduced_back: vec![None; number_of_events],
      reduced_front: vec![Vec::new(); number_of_events],
    }
  }
}

fn get_tail(
  head: usize,
  array: &Vec<Option<Vec<usize>>>
) -> usize {
  for i in (head + 1) .. array.len() {
    if array[i] == None {
      return i;
    }
  }

  array.len()
}

fn expand_reduced_front(
  alignment: &mut Alignment,
  front_vertex: usize
) {
  if alignment.front[front_vertex].len() != 1 {
    return
  }

  let mut next = alignment.reduced_front[alignment.reduced_front[front_vertex][0]][0];

  while next > 0 {
    alignment.reduced_front[front_vertex].push(next);

    if alignment.reduced_front[next].len() > 0 {
      next = alignment.reduced_front[next][0];
    } else {
      return
    }
  }
}

fn shares_linchpin(
  alignment: &Alignment,
  mid_front: usize,
  front_vertex: usize
) -> bool {
  match &alignment.reduced_back[mid_front] {
    Some(reduced_back_vector) => {
      for i in (0 .. reduced_back_vector.len()).rev() {
        let linchpin = reduced_back_vector[i];
    
        if alignment.reduced_front[front_vertex].iter().any(|a| *a == linchpin) {
          return true;
        }
      }
    
      false
    },
    None => false
  }
}

fn has_front_collision(
  alignment: &Alignment,
  back: usize,
  mid_fron_usize: usize
) -> bool {
  back != mid_fron_usize
    && (alignment.reduced_front[back].iter().any(
        |a| *a == mid_fron_usize) || shares_linchpin(
                                                      alignment,
                                                      mid_fron_usize,
                                                      back
                                                    ))
}

fn find_next_reduced_front_from_back(
  alignment: &mut Alignment,
  front_vertex: usize
) -> Option<usize> {
  let mut mid_front: Option<usize> = None;

  let reduced_back_front_vertex = match &alignment.reduced_back[front_vertex] {
    Some(a) => a.clone(),
    None => vec![]
  };

  for i in 0 .. alignment.back[front_vertex].len() {
    let back = alignment.back[front_vertex][i];

    if reduced_back_front_vertex.iter().any(|a| *a == back) {
      expand_reduced_front(alignment, back);

      if let Some(mid_fron_usize) = mid_front {
        if has_front_collision(alignment, mid_fron_usize, back) {
          mid_front.replace(back);
        }
      } else {
        mid_front.replace(back);
      }
    }
  }

  mid_front
}

fn build_reduced_front(
  alignment: &mut Alignment
) {
  let mut reduced_back_is_back = false;
  let mut next: Option<usize> = None;

  for i in 0 .. alignment.front.len() {
    if let Some(reduced_back_i) = &alignment.reduced_back[i] {
      if alignment.back[i].len() == reduced_back_i.len() {
        let reduced_back_front_i_0_length = if let Some(
          reduced_back_front_i_0
        ) = &alignment.reduced_back[alignment.front[i][0]] {
          reduced_back_front_i_0.len()
        } else {
          0
        };
        
        reduced_back_is_back = true;

        if alignment.front[i].len() > 0
            && reduced_back_front_i_0_length > reduced_back_i.len() {
          alignment.reduced_front[i].push(alignment.front[i][0]);
        }
      }
    }

    if !reduced_back_is_back {
      let mut should_add_next = false;

      if next == None {
        if let Some(next_reduced_front_usize) = find_next_reduced_front_from_back(
          alignment,
          i
        ) {
          next.replace(next_reduced_front_usize);
        }
      }

      let is_next_present_in_back = if let Some (next_usize) = next {
        alignment.back[alignment.front[i][0]].iter().any(|a| *a == next_usize)
      } else {
        false
      };

      if alignment.front[i].len() > 0 && is_next_present_in_back {
        if let (
          Some(back_front),
          Some(reduced_back_i)
        ) = (
          &alignment.reduced_back[alignment.front[i][0]],
          &alignment.reduced_back[i]
        ) {
          if back_front.len() < reduced_back_i.len() {
            should_add_next = true;
          } else {
            alignment.reduced_front[i].push(alignment.front[i][0]);
          }
        }
      } else {
        should_add_next = true;
      }

      if should_add_next {
        if let Some(next_usize) = next {
          alignment.reduced_front[i].push(next_usize);
          next = None;
        }
      }
    }
  }
}

fn build_reduced_back(
  alignment: &mut Alignment
) {
  let mut has_back = true;

  while has_back {
    let head = alignment.reduced_back.iter().position(|b| *b == None);

    if let Some(mut head_usize) = head {
      let tail = get_tail(head_usize, &alignment.reduced_back);

      let path: Vec<usize> = if head_usize > 0 {
        let end_of_path = vec![head_usize - 1];

        match &alignment.reduced_back[head_usize - 1] {
          Some(previous_r_back) => {
            [previous_r_back.clone(), end_of_path].concat()
          },
          None => {
            end_of_path
          }
        }
      } else {
        vec![]
      };

      while head_usize < tail {
        alignment.reduced_back[head_usize] = Some(path.clone());
        let next = alignment.front[head_usize].last();

        head_usize = if let Some(next_usize) = next {
          if *next_usize >= tail {
            tail
          } else {
            *next_usize + 1
          }
        } else {
          head_usize + 1
        }
      }
    } else {
      has_back = false;
    }
  }

  build_reduced_front(alignment);
}

fn generate_alignment(
  sorted_events: &Vec<sorted_event::SortedEvent>,
) -> Alignment {
  let number_of_events = sorted_events.len();
  let mut alignment = Alignment::new(number_of_events);

  for i in 0 .. number_of_events {
    for j in (i + 1) .. number_of_events {
      if sorted_events[j].event.start < sorted_events[i].event.end {
        alignment.front[i].push(j);
      }
    }

    for j in 0 .. i {
      if sorted_events[j].event.end > sorted_events[i].event.start {
        alignment.back[i].push(j);
      }
    }
  }

  build_reduced_back(&mut alignment);

  alignment
}

fn add_edge_to_dags(
  alignment: &Alignment,
  dag_builder: &mut dag_builder::DagBuilder,
  from_vertex: usize,
  to_vertex: usize
) {
  if alignment.reduced_front[to_vertex][0] == from_vertex {
    dag_builder.backward_dag.add_edge(from_vertex, to_vertex);
  }

  if let Some(reduce_back_to) = &alignment.reduced_back[to_vertex] {
    if reduce_back_to[reduce_back_to.len() - 1] == from_vertex {
      dag_builder.forward_dag.add_edge(from_vertex, to_vertex);
    }
  }
}

fn add_adges_to_dags(
  alignment: &Alignment,
  dag_builder: &mut dag_builder::DagBuilder,
  from_vertex: usize
) {
  if let Some(reduced_back_from) = &alignment.reduced_back[from_vertex] {
    if reduced_back_from.len() > 0 {
      dag_builder.backward_dag.add_edge(
        from_vertex,
        reduced_back_from[reduced_back_from.len() - 1]
      );
    }
  }

  if alignment.reduced_front[from_vertex].len() > 0 {
    dag_builder.forward_dag.add_edge(
      from_vertex,
      alignment.reduced_front[from_vertex][0]
    );
  }

  for i in (0 .. alignment.reduced_back.len()).rev() {
    if i == from_vertex {
      continue;
    }

    add_edge_to_dags(alignment, dag_builder, from_vertex, i);
  }
}

pub struct TimeRespectiveTilingMethod;

impl TimeRespectiveTilingMethod {
  pub fn new() -> TimeRespectiveTilingMethod {
    TimeRespectiveTilingMethod {}
  }
}

impl tiling_method::TilingMethod for TimeRespectiveTilingMethod {
  fn tile(
    &self,
    tiles: &mut Vec<tile::Tile>,
    sorted_events: &Vec<sorted_event::SortedEvent>,
    _tiler_options: &tiler_options::TilerOptions
  ) {
    if sorted_events.len() == 0 {
      return;
    }

    let alignment = generate_alignment(sorted_events);
    let mut dag_builder = dag_builder::DagBuilder::new(sorted_events.len() as u128);

    for i in 0 .. tiles.len() {
      add_adges_to_dags(&alignment, &mut dag_builder, i);
    }

    dag_builder.update_tiles(tiles);
  }
}
