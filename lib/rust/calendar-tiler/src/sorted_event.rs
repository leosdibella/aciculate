use std::fmt::{self, Formatter, Display};
use crate::event;
use crate::tile;

#[derive(PartialEq, PartialOrd, Copy, Clone)]
pub struct SortedEvent {
  pub event: event::Event,
  pub original_index: usize,
  pub sorted_index: usize,
  pub tile: tile::Tile
}

impl Display for SortedEvent {
  fn fmt(
    &self,
    f: &mut Formatter
  ) -> fmt::Result {
    write!(
      f,
      "event: {0}\ntile: {1}\noriginal index: {2}, sorted index: {3}",
      self.event,
      self.tile,
      self.original_index,
      self.sorted_index
    )
  }
}
