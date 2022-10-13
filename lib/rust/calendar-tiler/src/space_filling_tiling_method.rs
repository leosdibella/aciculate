use crate::sorted_event;
use crate::tile;
use crate::tiler;
use crate::tiling_method;
use crate::tiler_options;
use crate::dag_builder;
use crate::dag;

fn add_edges_to_dags(
  dag: &mut dag::DirectedAcyclicGraph,
  from_vertex: usize,
  to_vertices: Vec<usize>
) {
  for i in 0 .. to_vertices.len() {
    dag.add_edge(from_vertex, to_vertices[i]);
  }
}

fn get_sorted_events_collision_index(
  sorted_event_a: &sorted_event::SortedEvent,
  sorted_event_b: &sorted_event::SortedEvent,
  in_reverse: bool
) -> Option<i128> {
  let earlier_sorted_event = if in_reverse {
    sorted_event_b
  } else {
    sorted_event_a
  };

  let later_sorted_event = if in_reverse {
    sorted_event_a
  } else {
    sorted_event_b
  };

  if (!in_reverse && later_sorted_event.event.start >= earlier_sorted_event.event.end)
      || (in_reverse && earlier_sorted_event.event.start >= later_sorted_event.event.end) {
    return None;
  }

  if earlier_sorted_event.event.start == later_sorted_event.event.start
    || earlier_sorted_event.event.end == later_sorted_event.event.end
    || (earlier_sorted_event.event.start < later_sorted_event.event.start
          && earlier_sorted_event.event.end > later_sorted_event.event.start)
    || (earlier_sorted_event.event.start > later_sorted_event.event.start
          && earlier_sorted_event.event.start < later_sorted_event.event.end) {
    return Some(if in_reverse {
      earlier_sorted_event.sorted_index as i128
    } else {
      later_sorted_event.sorted_index as i128
    });
  }

  Some(-1)
}

fn collide_sorted_event_into_column(
  column: &Vec<sorted_event::SortedEvent>,
  sorted_event: &sorted_event::SortedEvent,
  in_reverse: bool
) -> Option<Vec<usize>> {
  let mut to_vertices: Vec<usize> = vec![];

  for i in 0 .. column.len() {
    let collision_index = get_sorted_events_collision_index(
      sorted_event,
      &column[i],
      in_reverse
    );

    match collision_index {
      Some(collision_index_int) => {
        if collision_index_int > -1 {
          to_vertices.push(collision_index_int as usize);
        }
      },
      None => {
        break;
      }
    }
  }

  if to_vertices.len() > 0 {
    Some(to_vertices)
  } else {
    None
  }
}

fn get_backward_to_vertices(
  columns: &Vec<Vec<sorted_event::SortedEvent>>,
  sorted_event: &sorted_event::SortedEvent,
  column_index: usize
) -> Vec<usize> {
  for i in (0 .. column_index).rev() {
    let to_vertices = collide_sorted_event_into_column(&columns[i], sorted_event, true);

    if let Some(to_vertices_vec) = to_vertices {
      return to_vertices_vec;
    }
  }

  vec![] as Vec<usize>
}

fn get_extended_forward_to_vertices(
  sorted_events: &Vec<sorted_event::SortedEvent>,
  columns: &Vec<Vec<sorted_event::SortedEvent>>,
  sorted_event: &sorted_event::SortedEvent,
  linchpin_sorted_event: &sorted_event::SortedEvent,
  column_index: usize
) -> Vec<usize> {
  let mut to_vertices: Vec<usize> = vec![];

  for i in (column_index + 1) .. columns.len() {
    let extended_to_vertices = collide_sorted_event_into_column(&columns[i], sorted_event, false);

    if let Some(extended_to_vertices_vec) = extended_to_vertices {
      for j in 0 .. extended_to_vertices_vec.len() {
        let collision_index = get_sorted_events_collision_index(
          linchpin_sorted_event,
          &sorted_events[extended_to_vertices_vec[j]],
          false
        );

        let mut should_return: bool = false;
        
        if let Some(collision_index_int) = collision_index {
          if collision_index_int > -1 {
            should_return = true;
          }
        }

        if should_return {
          return to_vertices;
        } else {
          to_vertices.push(extended_to_vertices_vec[j]);
        }
      }
    }
  }

  to_vertices
}

fn get_forward_to_vertices(
  sorted_events: &Vec<sorted_event::SortedEvent>,
  columns: &Vec<Vec<sorted_event::SortedEvent>>,
  sorted_event: &sorted_event::SortedEvent,
  column_index: usize
) -> Vec<usize> {
  for i in (column_index + 1) .. columns.len() {
    let to_vertices = collide_sorted_event_into_column(&columns[i], sorted_event, false);

    if let Some(to_vertices_vec) = to_vertices {
      let linchpin_sorted_event = sorted_events[to_vertices_vec[0]];

      if to_vertices_vec.len() > 0 && sorted_event.event.end > linchpin_sorted_event.event.start {
        return [
          to_vertices_vec,
          get_extended_forward_to_vertices(
            sorted_events,
            columns,
            sorted_event,
            &linchpin_sorted_event,
            i
          )
        ].concat();
      }

      return to_vertices_vec;
    }
  }

  vec![] as Vec<usize>
}

pub struct SpaceFillingTilingMethod;

impl SpaceFillingTilingMethod {
  pub fn new() -> SpaceFillingTilingMethod {
    SpaceFillingTilingMethod {}
  }
}

impl tiling_method::TilingMethod for SpaceFillingTilingMethod {
   fn tile(
    &self,
    tiles: &mut Vec<tile::Tile>,
    sorted_events: &Vec<sorted_event::SortedEvent>,
    tiler_options: &tiler_options::TilerOptions
  ) {
    if sorted_events.len() == 0 {
      return;
    }

    let columns = tiler::generate_columns(sorted_events, tiler_options);
    let mut dag_builder = dag_builder::DagBuilder::new(sorted_events.len() as u128);

    for i in 0 .. columns.len() {
      let column = &columns[i];

      for j in 0 .. column.len() {
        add_edges_to_dags(
          &mut dag_builder.backward_dag,
          column[j].sorted_index,
          get_backward_to_vertices(
            &columns,
            &column[j],
            i
          )
        );

        add_edges_to_dags(
          &mut dag_builder.forward_dag,
          column[j].sorted_index,
          get_forward_to_vertices(
            sorted_events,
            &columns,
            &column[j],
            i
          )
        );
      }
    }

    dag_builder.update_tiles(tiles);
  }
}
