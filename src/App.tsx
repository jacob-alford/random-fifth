import React, { useCallback, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import { interval } from "rxjs";
import styled from "styled-components";

const audio = new AudioContext();

const FREQUENCIES = [
  261.63,
  277.18,
  293.66,
  311.13,
  329.63,
  349.23,
  369.99,
  392.0,
  415.3,
  440,
  466.16,
  493.88
];
const INITIAL_FREQUENCY = FREQUENCIES[(Math.random() * FREQUENCIES.length) | 0];
const CONSECUTIVE_FREQUENCY_RATIO = Math.pow(2, 7 / 12);
const MIN_FREQUENCY =
  INITIAL_FREQUENCY * Math.pow(CONSECUTIVE_FREQUENCY_RATIO, -4);
const MAX_FREQUENCY =
  INITIAL_FREQUENCY * Math.pow(CONSECUTIVE_FREQUENCY_RATIO, 4);

const getOsc = () => {
  const oscillator = audio.createOscillator();
  oscillator.type = "sine";
  oscillator.connect(audio.destination);
  return oscillator;
};
const setFreq = (sf: (oldFreq: number) => number) => (osc: OscillatorNode) => {
  osc.frequency.value = sf(osc.frequency.value);
  return osc;
};
const playOsc = (duration: number) => (osc: OscillatorNode) => {
  osc.start();
  return interval(duration);
};
const getNextFreq = (oldFreq: number) =>
  pipe(
    oldFreq *
      Math.pow(CONSECUTIVE_FREQUENCY_RATIO, [-1, 1][(Math.random() * 2) | 0]),
    newFreq =>
      newFreq > MAX_FREQUENCY
        ? oldFreq / CONSECUTIVE_FREQUENCY_RATIO
        : newFreq < MIN_FREQUENCY
        ? oldFreq * CONSECUTIVE_FREQUENCY_RATIO
        : newFreq
  );
const playLoop = (frequency: number) =>
  pipe(getOsc(), osc =>
    pipe(
      osc,
      setFreq(() => frequency),
      playOsc(250),
      intv => intv.subscribe(() => pipe(osc, setFreq(getNextFreq)))
    )
  );

const AppContainer = styled.div`
  display: flex;
  flex-flow: column;
  width: 100vw;
  height: 100vh;
  justify-content: space-evenly;
  align-items: center;
`;

const Button = styled.button`
  background: palevioletred;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-weight: 800;
  font-size: 48px;
  color: white;
  padding: 24px;
  height: 100%;
  transition: background 0.5s;
  &:disabled {
    background: rgba(0, 0, 0, 0.24);
  }
`;

const Header = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-weight: 100;
  font-size: 96px;
  color: rgba(0, 0, 0, 0.69);
`;

const App = () => {
  const [s, ss] = useState(false);
  const startSound = useCallback(() => {
    playLoop(INITIAL_FREQUENCY);
    ss(true);
  }, []);
  const reload = useCallback(() => {
    window.location.reload();
  }, []);
  return (
    <AppContainer>
      <Header>{INITIAL_FREQUENCY}</Header>
      <div>
        <Button onClick={startSound} disabled={s}>
          ▶️ Play
        </Button>
        <Button onClick={reload}>🔃 Reload</Button>
      </div>
    </AppContainer>
  );
};

export default App;
