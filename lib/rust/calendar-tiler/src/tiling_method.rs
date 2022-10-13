use crate::tile;
use crate::sorted_event;
use crate::tiler_options;
use std::str::FromStr;

pub trait TilingMethod {
  fn tile(
    &self,
    tiles: &mut Vec<tile::Tile>,
    sorted_events: &Vec<sorted_event::SortedEvent>,
    tiler_options: &tiler_options::TilerOptions,
  );
}

pub enum TilingMethodName {
  Basic = 1,
  SpaceFilling = 2,
  TimeRespective = 3
}

impl<T: ?Sized> TilingMethod for Box<T> where T: TilingMethod {
  fn tile(
    &self,
    tiles: &mut Vec<tile::Tile>,
    sorted_events: &Vec<sorted_event::SortedEvent>,
    tiler_options: &tiler_options::TilerOptions
  ) {
    (**self).tile(
      tiles,
      sorted_events,
      tiler_options
    );
  }
}

impl FromStr for TilingMethodName {
  type Err = ();

  fn from_str(
    s: &str
  ) -> Result<TilingMethodName, Self::Err> {
    match s {
      "1" => Ok(TilingMethodName::Basic),
      "2" => Ok(TilingMethodName::SpaceFilling),
      "3" => Ok(TilingMethodName::TimeRespective),
      _ => Err(())
    }
  }
}
