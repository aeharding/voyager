use tauri::webview::PageLoadEvent;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .on_page_load(|webview, payload| {
            if payload.event() != PageLoadEvent::Finished {
                return;
            }

            // The window starts hidden and the frontend shows it once mounted
            // (prevents flash of unstyled content). If the frontend dies
            // before mounting, show the window anyway so failure isn't
            // invisible. Timed from page load, not process start, so a slow
            // dev server compile can't trigger it early.
            let window = webview.window();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(3));
                if !window.is_visible().unwrap_or(false) {
                    let _ = window.show();
                }
            });
        })
        .run(tauri::generate_context!())
        .expect("error while running Voyager");
}
