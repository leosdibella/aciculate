mod event;
mod tile;
mod sorted_event;
mod tiler_options;
mod tiler;
mod tiling_method;
mod basic_tiling_method;
mod space_filling_tiling_method;
mod time_respective_tiling_method;
mod dag_builder;
mod dag;
use rand::Rng;
use std::env;

const HOURS_PER_DAY: u8 = 24;
const MAX_NUMBER_OF_EVENTS: u8 = 60;

fn get_tiling_method(s: &str) -> std::boxed::Box<dyn tiling_method::TilingMethod> {
    match s.parse::<tiling_method::TilingMethodName>() {
        Ok(tiling_method::TilingMethodName::SpaceFilling) => {
            Box::new(space_filling_tiling_method::SpaceFillingTilingMethod::new())
        },
        Ok(tiling_method::TilingMethodName::TimeRespective) => {
            Box::new(time_respective_tiling_method::TimeRespectiveTilingMethod::new())
        },
        _ => {
            Box::new(basic_tiling_method::BasicTilingMethod::new())
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();

    let tiling_method_arg = if args.len() > 1 {
        args[1].to_string()
    } else {
        (tiling_method::TilingMethodName::Basic as i32).to_string()
    };

    let tiling_method = get_tiling_method(&tiling_method_arg);
    let mut rng = rand::thread_rng();
    let number_of_events: u128 = rng.gen_range(1..MAX_NUMBER_OF_EVENTS as u128);
    let mut events: Vec<event::Event> = vec![];

    for _ in 0 .. number_of_events {
        let start: f64 = rng.gen_range(0_f64..HOURS_PER_DAY as f64);
        let end: f64 = rng.gen_range(start..(HOURS_PER_DAY as f64));

        events.push(event::Event {
            start: start,
            end: end
        });
    }

    let mut tiler = tiler::Tiler::new(
        events,
        tiler_options::TilerOptions::new(0.0001),
        tiling_method
    );

    tiler.tile();
    tiler.print_tiles();
}
