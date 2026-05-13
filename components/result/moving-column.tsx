export function MovingChangeIndicator({
  isMoving,
  benguaIsYang,
  showArrow
}: {
  isMoving: boolean;
  benguaIsYang: boolean;
  showArrow: boolean;
}) {
  if (!isMoving) {
    return (
      <span className="inline-flex min-w-[2.75rem] justify-center" aria-hidden />
    );
  }
  const symbol = benguaIsYang ? (
    <span className="text-lg leading-none text-red-600" title="阳变阴">
      ○
    </span>
  ) : (
    <span
      className="text-lg font-semibold leading-none text-red-600"
      title="阴变阳"
    >
      ×
    </span>
  );

  if (!showArrow) {
    return (
      <span className="inline-flex min-w-[2.75rem] items-center justify-center gap-0.5">
        {symbol}
      </span>
    );
  }

  return (
    <span
      className="inline-flex min-w-[2.75rem] items-center justify-center gap-0.5 text-red-600"
      title="动爻（本卦→变卦）"
    >
      {symbol}
      <span className="text-base leading-none" aria-hidden>
        →
      </span>
    </span>
  );
}
