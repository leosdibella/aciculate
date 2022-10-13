use crate::sorted_event;
use crate::tile;
use crate::tiler;
use crate::tiling_method;
use crate::tiler_options;

pub struct BasicTilingMethod;

fn tile_from_columns(
  columns: &Vec<Vec<sorted_event::SortedEvent>>,
  tiles: &mut Vec<tile::Tile>,
) {
  let columns_length = columns.len();
  let column_dx = 1.0 / (columns_length as f64);

  for i in (0 .. columns_length).rev() {
    let column_x = (i as f64) / (columns_length as f64);

    for j in (0 .. columns[i].len()).rev() {
      let tile_index = columns[i][j].sorted_index;

      tiles[tile_index].x = column_x;
      tiles[tile_index].dx = column_dx;
    }
  }
}

impl BasicTilingMethod {
  pub fn new() -> BasicTilingMethod {
    BasicTilingMethod {}
  }
}

impl tiling_method::TilingMethod for BasicTilingMethod {
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

    tile_from_columns(&columns, tiles);
  }
}
