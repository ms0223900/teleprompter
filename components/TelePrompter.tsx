"use client";

import { ChevronLeft, ChevronRight, Clock, FileText, FlipHorizontal, Hourglass, Pause, Play, RotateCcw, Scissors, Settings2, Timer, Type, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type IntervalId = ReturnType<typeof setInterval>;

/** Canvas 2D 快取於模組層，避免在 render/useMemo 內讀取 ref（eslint react-hooks/refs）。 */
let measureCtx: CanvasRenderingContext2D | null = null;

function getTextWidth(text: string, font: string): number {
  if (typeof document === "undefined") return 0;
  if (!measureCtx) {
    const canvas = document.createElement("canvas");
    measureCtx = canvas.getContext("2d");
  }
  if (!measureCtx) return 0;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

/**
 * 智慧切分文字函式
 * @param content 原始文本
 * @param size 字體大小
 * @param width 容器寬度
 * @returns 切分後的行陣列
 */
function autoWrapText(content: string, size: number, width: number): string[] {
  const font = `bold ${size}px sans-serif`;
  const maxWidth = width * 0.9; // 預留 10% 邊距
  const rawParagraphs = content.split("\n").filter((p) => p.trim().length > 0);
  const finalLines: string[] = [];

  rawParagraphs.forEach((para) => {
    const segments = para.match(/[^，。！？；：、]+[，。！？；：、]?/g) || [para];
    let currentLine = "";

    segments.forEach((seg) => {
      const testLine = currentLine + seg;
      const testWidth = getTextWidth(testLine, font);

      if (testWidth > maxWidth && currentLine !== "") {
        finalLines.push(currentLine);
        currentLine = seg;

        while (getTextWidth(currentLine, font) > maxWidth) {
          let splitIdx = 1;
          while (getTextWidth(currentLine.substring(0, splitIdx + 1), font) <= maxWidth) {
            splitIdx++;
          }
          finalLines.push(currentLine.substring(0, splitIdx));
          currentLine = currentLine.substring(splitIdx);
        }
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) finalLines.push(currentLine);
  });

  return finalLines;
}

/** 預設語速（字／分） */
const DEFAULT_WPM = 170;

/** 預設字體大小（px） */
const DEFAULT_FONT_SIZE = 42;

/** 預設稿文 */
const DEFAULT_TEXT =

  "歡迎使用智慧斷句提詞器！\n\n這是一個非常強大的功能。系統會自動偵測目前的螢幕寬度與字體大小，將過長的段落自動切分為適合的一行。這樣你就不需要手動按 Enter 來換行了。\n\n即使是很長很長的一段話，只要我們開啟了智慧斷句，它就會優先尋找標點符號，並確保每一行都不會超出螢幕範圍。試著調整看看字體大小，你會發現每一行的字數會自動隨之調整！";
/** 是否鏡像顯示 */
const DEFAULT_IS_MIRRORED = false;

/** 是否處於自動捲動播放中 */
const DEFAULT_IS_SCROLLING = false;

/** 初始模式：`edit` 編輯／`play` 播放 */
const DEFAULT_MODE = "edit" as const;

/** 目前高亮行索引 */
const DEFAULT_CURRENT_LINE_INDEX = 0;

/** 播放經過時間（秒） */
const DEFAULT_ELAPSED_TIME = 0;

/** 是否展開設定面板 */
const DEFAULT_SHOW_SETTINGS = false;

/** 智慧斷句（自動換行切行）是否開啟 */
const DEFAULT_AUTO_WRAP = true;

/** 目前行內進度（毫秒） */
const DEFAULT_LINE_PROGRESS_MS = 0;

/** 容器參考寬度（px），供斷句量測；實際會由 DOM 更新 */
const DEFAULT_CONTAINER_WIDTH = 1000;

export default function TelePrompter() {
  // 狀態管理
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isMirrored, setIsMirrored] = useState(DEFAULT_IS_MIRRORED);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [isScrolling, setIsScrolling] = useState(DEFAULT_IS_SCROLLING);
  const [mode, setMode] = useState<"edit" | "play">(DEFAULT_MODE);
  const [currentLineIndex, setCurrentLineIndex] = useState(DEFAULT_CURRENT_LINE_INDEX);
  const [elapsedTime, setElapsedTime] = useState(DEFAULT_ELAPSED_TIME);
  const [showSettings, setShowSettings] = useState(DEFAULT_SHOW_SETTINGS);
  const [autoWrap, setAutoWrap] = useState(DEFAULT_AUTO_WRAP); // 自動智慧斷句開關

  const [lineProgressMs, setLineProgressMs] = useState(DEFAULT_LINE_PROGRESS_MS);
  const [containerWidth, setContainerWidth] = useState(DEFAULT_CONTAINER_WIDTH); // 容器參考寬度

  const clockRef = useRef<IntervalId | null>(null);
  const progressIntervalRef = useRef<IntervalId | null>(null);

  // 智慧切分邏輯
  const processedLines = useMemo(() => {
    if (!autoWrap) {
      return text.split('\n').filter(line => line.trim().length > 0);
    }
    return autoWrapText(text, fontSize, containerWidth);
  }, [text, fontSize, containerWidth, autoWrap]);

  // 監聽容器寬度變化
  useEffect(() => {
    const updateWidth = () => {
      const el = document.getElementById('teleprompter-content');
      if (el) setContainerWidth(el.offsetWidth);
    };
    window.addEventListener('resize', updateWidth);
    updateWidth();
    return () => window.removeEventListener('resize', updateWidth);
  }, [mode]);

  // 3. 計算純文字字數
  const getCleanCharCount = (str: string) => {
    const regex = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~，。！？；：「」『』（）—…\s]/g;
    return str.replace(regex, '').length;
  };

  // 4. 計算總統計數據
  const stats = useMemo(() => {
    const totalChars = getCleanCharCount(text);
    const estimatedTotalSeconds = totalChars > 0 ? Math.ceil((totalChars / wpm) * 60) : 0;
    return { totalChars, estimatedTotalSeconds };
  }, [text, wpm]);

  // 5. 當前行所需總毫秒數
  const currentLineDuration = useMemo(() => {
    const charCount = getCleanCharCount(processedLines[currentLineIndex] || "");
    return charCount <= 0 ? 1000 : (charCount / wpm) * 60 * 1000;
  }, [currentLineIndex, processedLines, wpm]);

  // 6. 核心換行邏輯與行內進度計時
  useEffect(() => {
    if (isScrolling && mode === 'play') {
      const startTime = Date.now() - lineProgressMs;

      progressIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = now - startTime;

        if (diff >= currentLineDuration) {
          if (currentLineIndex < processedLines.length - 1) {
            setLineProgressMs(0);
            setCurrentLineIndex(prev => prev + 1);
          } else {
            setIsScrolling(false);
            setLineProgressMs(currentLineDuration);
          }
          const id = progressIntervalRef.current;
          if (id !== null) clearInterval(id);
        } else {
          setLineProgressMs(diff);
        }
      }, 16);
    } else {
      const id = progressIntervalRef.current;
      if (id !== null) clearInterval(id);
    }
    return () => {
      const id = progressIntervalRef.current;
      if (id !== null) clearInterval(id);
    };
    // lineProgressMs 用於銜接暫停後的進度；列入依賴會每幀重設 interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolling, currentLineIndex, currentLineDuration, mode, processedLines.length]);

  // 7. 已過時間計時器 (秒)
  useEffect(() => {
    if (isScrolling && mode === 'play') {
      clockRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      const id = clockRef.current;
      if (id !== null) clearInterval(id);
    }
    return () => {
      const id = clockRef.current;
      if (id !== null) clearInterval(id);
    };
  }, [isScrolling, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetPlay = () => {
    setIsScrolling(false);
    setCurrentLineIndex(0);
    setElapsedTime(0);
    setLineProgressMs(0);
  };

  const progressPercent = (lineProgressMs / currentLineDuration) * 100;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-white/5 backdrop-blur-md z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
            提詞夥伴
          </h1>

          <nav className="flex bg-gray-800 rounded-full p-1 text-sm border border-white/5">
            <button
              onClick={() => { setMode('edit'); setIsScrolling(false); }}
              className={`px-6 py-1.5 rounded-full transition ${mode === 'edit' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white'}`}
            >
              編輯稿件
            </button>
            <button
              onClick={() => { setMode('play'); resetPlay(); }}
              className={`px-6 py-1.5 rounded-full transition ${mode === 'play' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white'}`}
            >
              播放
            </button>
          </nav>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
            <div className="flex items-center gap-1.5 text-gray-400" title="總字數">
              <FileText size={14} />
              <span className="text-xs font-mono">{stats.totalChars}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400" title="預估總時長">
              <Hourglass size={14} />
              <span className="text-xs font-mono">{formatTime(stats.estimatedTotalSeconds)}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded border transition ${isScrolling ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-black/20'}`}>
              <Clock size={14} className={isScrolling ? "text-green-400 animate-pulse" : "text-gray-400"} />
              <span className="font-mono text-sm text-blue-100">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full transition ${showSettings ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          <Settings2 size={20} />
        </button>
      </header>

      {/* 側邊設定面板 */}
      {showSettings && (
        <div className="absolute top-20 right-6 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-6 animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-200">偏好設定</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300"><Scissors size={16} /> 智慧斷句 (Auto Wrap)</div>
              <button onClick={() => setAutoWrap(!autoWrap)} className={`w-12 h-6 rounded-full transition-colors relative ${autoWrap ? 'bg-green-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoWrap ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-300"><FlipHorizontal size={16} /> 鏡像顯示</div>
              <button onClick={() => setIsMirrored(!isMirrored)} className={`w-12 h-6 rounded-full transition-colors relative ${isMirrored ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isMirrored ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <div className="flex items-center gap-2"><Type size={16} /> 字體大小</div>
                <span className="font-mono">{fontSize}</span>
              </div>
              <input type="range" min="20" max="100" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-blue-500 bg-gray-700 rounded-lg h-1.5 appearance-none" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <div className="flex items-center gap-2"><Timer size={16} /> 每分鐘語速 (WPM)</div>
                <span className="font-mono text-blue-400 font-bold">{wpm}</span>
              </div>
              <input type="range" min="50" max="300" step="10" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="w-full accent-blue-500 bg-gray-700 rounded-lg h-1.5 appearance-none" />
            </div>
          </div>
        </div>
      )}

      {/* 主要內容區 */}
      <main className="flex-1 relative overflow-hidden" id="teleprompter-content" onClick={() => setShowSettings(false)}>
        {mode === 'edit' ? (
          <div className="h-full p-6 max-w-5xl mx-auto w-full">
            <textarea
              className="w-full h-full bg-transparent text-gray-300 p-8 rounded-3xl border border-white/5 focus:border-blue-500/50 outline-none resize-none text-lg leading-relaxed font-mono shadow-inner transition-all"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="輸入稿件內容..."
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-10 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(29,78,216,0.05),transparent_70%)] pointer-events-none" />

            <div
              style={{
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
              }}
              className="w-full max-w-6xl flex flex-col items-center z-10"
            >
              {/* 上一行 */}
              <div className="text-white/5 select-none mb-8 h-16 overflow-hidden flex items-end">
                <span style={{ fontSize: `${fontSize * 0.6}px` }}>
                  {processedLines[currentLineIndex - 1] || ""}
                </span>
              </div>

              {/* 當前行 (卡拉OK染色效果) */}
              <div className="text-center transition-all duration-300 mb-8 min-h-[160px] flex items-center justify-center w-full px-4">
                <span
                  style={{
                    fontSize: `${fontSize}px`,
                    backgroundImage: `linear-gradient(to right, #60a5fa ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  className="font-bold tracking-wider leading-[1.4] transition-all duration-75"
                >
                  {processedLines[currentLineIndex]}
                </span>
              </div>

              {/* 下一行 */}
              <div className="text-white/20 select-none h-16 overflow-hidden flex items-start text-center">
                <span style={{ fontSize: `${fontSize * 0.6}px` }}>
                  {processedLines[currentLineIndex + 1] || ""}
                </span>
              </div>
            </div>

            {/* 控制欄 */}
            <div className="absolute bottom-12 flex items-center gap-6 bg-gray-900/80 backdrop-blur-xl px-10 py-5 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30">
              <button
                onClick={() => { setLineProgressMs(0); setCurrentLineIndex(prev => Math.max(0, prev - 1)); }}
                className="p-2 text-gray-400 hover:text-blue-400 transition"
              >
                <ChevronLeft size={32} />
              </button>

              <button
                onClick={() => setIsScrolling(!isScrolling)}
                className="w-16 h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
              >
                {isScrolling ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
              </button>

              <button
                onClick={() => { setLineProgressMs(0); setCurrentLineIndex(prev => Math.min(processedLines.length - 1, prev + 1)); }}
                className="p-2 text-gray-400 hover:text-blue-400 transition"
              >
                <ChevronRight size={32} />
              </button>

              <div className="h-8 w-px bg-white/10 mx-2" />

              <button onClick={resetPlay} className="text-gray-500 hover:text-red-400 transition">
                <RotateCcw size={22} />
              </button>

              <div className="flex flex-col items-center ml-2">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest text-center">Step</span>
                <span className="text-sm font-mono text-blue-400">
                  {currentLineIndex + 1}<span className="text-gray-600 mx-1">/</span>{processedLines.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}