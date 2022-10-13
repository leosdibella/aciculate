use std::fmt::{self, Formatter, Display};

#[derive(PartialEq, PartialOrd, Copy, Clone)]
pub struct Event {
  pub start: f64,
  pub end: f64,
}

impl Display for Event {
  fn fmt(
    &self, 
    f: &mut Formatter
  ) -> fmt::Result {
    write!(
      f,
      "start: {:.3} end: {:.3}\n",
      self.start,
      self.end
    )
  }
}
