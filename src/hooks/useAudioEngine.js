import { useEffect, useRef, useState } from 'react'

export function useAudioEngine() {
  const ctxRef = useRef(null)
  const oscillatorRef = useRef(null)
  const gainRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const NOTE_FREQUENCIES = {
    C4: 261.63, D4: 293.66, E4: 329.63,
    F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  }

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      gainRef.current = ctxRef.current.createGain()
      gainRef.current.connect(ctxRef.current.destination)
      gainRef.current.gain.value = 0
    }
    return ctxRef.current
  }

  function playNote(note, volume = 0.5) {
    const ctx = getCtx()
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop() } catch (_) {}
    }
    const osc = ctx.createOscillator()
    const gain = gainRef.current
    osc.type = 'sine'
    osc.frequency.setValueAtTime(NOTE_FREQUENCIES[note] || 440, ctx.currentTime)
    osc.connect(gain)

    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(Math.min(volume * 0.3, 0.3), ctx.currentTime + 0.01)

    osc.start()
    oscillatorRef.current = osc
    setIsPlaying(true)
  }

  function stopNote() {
    if (!gainRef.current || !ctxRef.current) return
    const gain = gainRef.current
    gain.gain.cancelScheduledValues(ctxRef.current.currentTime)
    gain.gain.setValueAtTime(gain.gain.value, ctxRef.current.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.05)
    setTimeout(() => {
      try { oscillatorRef.current?.stop() } catch (_) {}
      setIsPlaying(false)
    }, 60)
  }

  function playDrum() {
    const ctx = getCtx()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02))
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const drumGain = ctx.createGain()
    drumGain.gain.value = 0.4
    source.connect(drumGain)
    drumGain.connect(ctx.destination)
    source.start()
  }

  return { playNote, stopNote, playDrum, isPlaying }
}
