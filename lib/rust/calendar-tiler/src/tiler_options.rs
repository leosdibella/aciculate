const DEFAULT_ERROR_BOUND: f64 = 0.0000001;

pub struct TilerOptions {
  pub error_bound: f64,
  pub number_of_decimal_places: u32,
  pub rounding_modifier: u128,
}

impl TilerOptions {
  pub fn new(error_bound: f64) -> TilerOptions {
    let sanitized_error_bound = if error_bound < 0.0 {
      error_bound.abs()
    } else if error_bound == 0.0 {
      DEFAULT_ERROR_BOUND
    } else {
      error_bound
    };

    let error_bound_string = error_bound.to_string();
    let sanitized_error_bound_parts: Vec<&str> = error_bound_string.split('.').collect();
    let mut number_of_decimal_places: u32 = 0;
    let mut rounding_modifier: u128 = 1;

    if sanitized_error_bound_parts.len() == 2 {
      let mantissa = sanitized_error_bound_parts[1];

      for c in mantissa.chars() {
        if c != '0' {
          break;
        }

        number_of_decimal_places += 1;
        rounding_modifier *= 10;
      }
    }
    
    TilerOptions {
      error_bound: sanitized_error_bound,
      number_of_decimal_places,
      rounding_modifier,
    }
  }
}
