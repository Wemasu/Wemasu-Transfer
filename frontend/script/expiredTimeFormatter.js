"use strict";

export function formatter(miliseconds) {
  let output;
  const days = Math.floor(miliseconds / 86400000);
  let hours = Math.floor(miliseconds / 3600000);
  let minutes = Math.floor(miliseconds / 60000);

  if (days > 0) {
    hours = hours - days * 24;
    minutes = minutes - (days * 1440 + hours * 60);
    output = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    minutes = minutes - hours * 60;
    output = `${hours}h ${minutes}m`;
  } else {
    output = `${minutes} minutes`;
  }
  if (minutes < 0) {
    output = `file will be deleted soon`;
  }

  return output;
}
