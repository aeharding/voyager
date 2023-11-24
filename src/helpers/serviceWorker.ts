export async function unloadServiceWorkerAndRefresh() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  } finally {
    window.location.href = "/";
  }
}
