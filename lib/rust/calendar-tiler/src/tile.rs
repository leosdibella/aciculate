use std::fmt::{self, Formatter, Display};

pub const X_SENTINEL: f64 = 0f64;
pub const DX_SENTINEL: f64 = 1f64;

#[derive(PartialEq, PartialOrd, Copy, Clone, Debug)]
pub struct Tile {
  pub x: f64,
  pub y: f64,
  pub dx: f64,
  pub dy: f64,
}

impl Display for Tile {
  fn fmt(
    &self,
    f: &mut Formatter
  ) -> fmt::Result {
    write!(
      f,
      "x: {:.3} dx: {:.3} y: {:.3} dy: {:.3}\n",
      self.x,
      self.dx,
      self.y,
      self.dy
    )
  }
}