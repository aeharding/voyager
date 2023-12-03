import React, { Dispatch, useEffect, useState } from "react";
import { isNative } from "../helpers/device";
import { useAppDispatch, useAppSelector } from "../store";
import { setInstances } from "../features/settings/settingsSlice";

export const DEFAULT_LEMMY_SERVERS = [
  "lemmy.world",
  "lemmy.ml",
  "beehaw.org",
  "sh.itjust.works",
];

let _customServers = DEFAULT_LEMMY_SERVERS;

export function useCustomServers(): [string[], Dispatch<string[]>, () => void] {
  const dispatch = useAppDispatch();
  const customServers = useAppSelector((state) => state.settings.instances);
  const setCustomServers = (servers: string[]) => {
    dispatch(setInstances(servers));
  };
  const resetCustomServers = () => setCustomServers(DEFAULT_LEMMY_SERVERS);

  return [customServers, setCustomServers, resetCustomServers];
}

export function getCustomServers() {
  return _customServers;
}

export function getDefaultServer() {
  return _customServers[0];
}

async function getConfig() {
  if (isNative()) return;

  const response = await fetch("/_config");

  const { customServers } = await response.json();

  if (customServers?.length) {
    _customServers = customServers;
  }
}

// Only needs to be done once for app load
const config = getConfig();

interface ConfigProviderProps {
  children?: React.ReactNode;
}

export default function ConfigProvider({ children }: ConfigProviderProps) {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Config is not necessary for app to run
    config.finally(() => {
      setConfigLoaded(true);
    });
  }, []);

  if (configLoaded) return children;
}
