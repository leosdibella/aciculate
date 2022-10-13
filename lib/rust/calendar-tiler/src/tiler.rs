use crate::event;
use crate::sorted_event;
use crate::tile;
use crate::tiling_method;
use crate::tiler_options;

fn get_event_sorter(error_bound: f64) -> impl Fn(
  &sorted_event::SortedEvent,
  &sorted_event::SortedEvent
) -> std::cmp::Ordering {
  move |a: &sorted_event::SortedEvent, b: &sorted_event::SortedEvent| -> std::cmp::Ordering {
    if a.event.start - b.event.start >= error_bound {
      if a.event.start - b.event.start == error_bound {
        if b.event.end - a.event.end >= error_bound {
          std::cmp::Ordering::Greater
        } else {
          std::cmp::Ordering::Less
        }
      } else {
        std::cmp::Ordering::Greater
      }
    } else {
      std::cmp::Ordering::Less
    }
  }
}

fn sort_events(
  events: &Vec<event::Event>,
  tiler_options: &tiler_options::TilerOptions
) -> Vec<sorted_event::SortedEvent> {
  let mut index: usize = 0;

  let mut sorted_events: Vec<sorted_event::SortedEvent> = events.iter().map(|&e| {
    let sorted_event = sorted_event::SortedEvent {
      event: e,
      original_index: index,
      sorted_index: 0,
      tile: tile::Tile {
        x: tile::X_SENTINEL,
        dx: tile::DX_SENTINEL,
        y: e.start,
        dy: e.end - e.start
      }
    };

    index += 1;

    sorted_event
  }).collect();

  let event_sorter = get_event_sorter(tiler_options.error_bound);

  sorted_events.sort_by(|a, b| event_sorter(&a, &b));

  for (i, mut sorted_event) in sorted_events.iter_mut().enumerate() {
    sorted_event.sorted_index = i;
  }

  sorted_events
}

pub struct Tiler<T: tiling_method::TilingMethod> {
  pub tiles: Vec<tile::Tile>,
  pub tiling_method: T,
  pub events: Vec<event::Event>,
  pub sorted_events: Vec<sorted_event::SortedEvent>,
  pub tiler_options: tiler_options::TilerOptions,
}

impl<T: tiling_method::TilingMethod> Tiler<T> {
  pub fn new(
    events: Vec<event::Event>,
    tiler_options: tiler_options::TilerOptions,
    tiling_method: T
  ) -> Tiler<T> {
    let sorted_events = self::sort_events(&events, &tiler_options);
    let tiles: Vec<tile::Tile> = sorted_events.iter().map(|e| e.tile).collect();

    Tiler::<T> {
      tiler_options,
      events: events,
      sorted_events,
      tiles: tiles,
      tiling_method,
    }
  }

  pub fn tile(&mut self) {
    self.tiling_method.tile(
      &mut self.tiles,
      &self.sorted_events,
      &self.tiler_options
    );
  }

  pub fn print_tiles(&self) {
    for tile in self.tiles.iter().enumerate() {
      println!("{:?}", tile);
    }
  }
}

fn get_event_column_index(
  columns: &Vec<Vec<sorted_event::SortedEvent>>,
  sorted_event: &sorted_event::SortedEvent,
  tiler_options: &tiler_options::TilerOptions
) -> Option<usize> {
  let mut column: &Vec<sorted_event::SortedEvent>;

  for i in 0 .. columns.len() {
    column = &columns[i];

    if sorted_event.event.start - column[column.len() - 1].event.end >= tiler_options.error_bound {
      return Some(i);
    }
  }
  
  None
}

pub fn generate_columns(
  sorted_events: &Vec<sorted_event::SortedEvent>,
  tiler_options: &tiler_options::TilerOptions
) -> Vec<Vec<sorted_event::SortedEvent>> {
  let mut columns: Vec<Vec<sorted_event::SortedEvent>> = vec![vec![sorted_events[0]]];

  for i in 0 .. sorted_events.len() {
    if let Some(column_index) = get_event_column_index(
      &columns,
      &sorted_events[i],
      tiler_options
    ) {
      columns[column_index].push(sorted_events[i]);
    } else {
      columns.push(vec![sorted_events[i]]);
    }
  }
            
  columns
}
