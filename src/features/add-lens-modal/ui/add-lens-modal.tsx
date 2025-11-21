import { MODAL_IDS } from '@/app/store';
import { ModalContainer } from '@/shared/ui/portal-modal';
import { useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import {
  MANUFACTURER_BRANDS_MAP,
  inferWearPeriodTitleForBrand,
  BrandWithWearPeriod
} from '@/shared/constants/lens-manufacturers';
import {
  Lens,
  lensTypeToWearPeriodMap
} from '@/app/store/slices/lens-management-slice';

interface AddLensModalProps {
  onClose: () => void;
  onAdd: (lens: Omit<Lens, 'id'>) => void;
  mode?: 'single' | 'pack';
}

export const AddLensModal = ({
  onClose,
  onAdd,
  mode = 'single'
}: AddLensModalProps) => {
  const DEFAULT_PACK_PAIR_COUNT = 3;

  const [formData, setFormData] = useState<Omit<Lens, 'id'>>({
    manufacturer: '',
    brand: '',
    wearPeriodTitle: 'Ежедневные',
    wearPeriodDays: 1,
    usagePeriodDays: 0,
    discardDate: null,
    status: 'unopened',
    sphere: '',
    baseCurveRadius: '8.6',
    openedDate: null
  });

  const [pairCountInput, setPairCountInput] = useState<string>(
    String(DEFAULT_PACK_PAIR_COUNT)
  );
  const [pairCountError, setPairCountError] = useState<string | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);

  const manufacturerToBrands = useMemo(() => {
    const map = new Map<string, Set<string>>();
    Object.entries(MANUFACTURER_BRANDS_MAP).forEach(([m, brands]) => {
      const names = (brands as BrandWithWearPeriod[]).map((b) => b.name);
      map.set(m, new Set(names));
    });
    return map;
  }, []);
  const manufacturerOptions = useMemo(() => {
    return Array.from(manufacturerToBrands.keys())
      .sort()
      .map((v) => ({ value: v, label: v }));
  }, [manufacturerToBrands]);
  const brandOptions = useMemo(() => {
    const currentManufacturer = (formData.manufacturer || '').trim();
    const brands = currentManufacturer
      ? manufacturerToBrands.get(currentManufacturer)
      : undefined;
    return brands
      ? Array.from(brands)
          .sort()
          .map((v) => ({ value: v, label: v }))
      : [];
  }, [manufacturerToBrands, formData.manufacturer]);

  const closeAndReset = () => {
    if (mode === 'pack') {
      setPairCountInput(String(DEFAULT_PACK_PAIR_COUNT));
      setPairCountError(null);
    }
    onClose();
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAndReset();
    }
  };

  const resetForm = () => {
    setFormData({
      manufacturer: '',
      brand: '',
      wearPeriodTitle: 'Ежедневные',
      wearPeriodDays: 1,
      usagePeriodDays: 0,
      discardDate: null,
      status: 'unopened',
      sphere: '',
      baseCurveRadius: '8.6',
      openedDate: null
    });
    setUsageError(null);
    if (mode === 'pack') {
      setPairCountInput(String(DEFAULT_PACK_PAIR_COUNT));
      setPairCountError(null);
    }
  };

  const handleSave = () => {
    if (formData.manufacturer && formData.sphere) {
      // validate usage period
      const up = formData.usagePeriodDays;
      const isUsageValid = Number.isFinite(up) && up >= 0 && up <= 365;
      if (!isUsageValid) {
        setUsageError('Введите число от 0 до 365');
        return;
      }
      let count = 1;
      if (mode === 'pack') {
        const parsed =
          pairCountInput.trim() === '' ? NaN : Number(pairCountInput);
        const intVal = Number.isFinite(parsed) ? Math.floor(parsed) : NaN;
        const isValid = Number.isFinite(intVal) && intVal >= 1 && intVal <= 50;
        if (!isValid) {
          setPairCountError('Введите целое число от 1 до 50');
          return;
        }
        count = intVal;
      }
      for (let i = 0; i < count; i += 1) {
        onAdd(formData);
      }
      closeAndReset();
    }
  };

  const handleCancel = () => {
    closeAndReset();
  };

  const updateFormData = (field: string, value: string | null | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setWearPeriodByTitle = (wearPeriodTitle: string) => {
    const wearPeriodDays =
      lensTypeToWearPeriodMap[
        wearPeriodTitle as keyof typeof lensTypeToWearPeriodMap
      ];
    updateFormData('wearPeriodTitle', wearPeriodTitle);
    updateFormData('wearPeriodDays', wearPeriodDays);
  };
  const handleWearPeriodChange = (wearPeriodTitle: string) => {
    setWearPeriodByTitle(wearPeriodTitle);
  };

  return (
    <ModalContainer name={MODAL_IDS.ADD_LENS}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
        onClick={handleBackgroundClick}
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-2xl sm:p-8 dark:from-gray-800 dark:to-gray-900">
          {/* Header with gradient background */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-4 text-white sm:mb-8 sm:p-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold sm:text-2xl">
                  {mode === 'pack'
                    ? 'Добавить упаковку линз'
                    : 'Добавить новую линзу'}
                </h3>
              </div>
              <button
                onClick={closeAndReset}
                className="ml-4 shrink-0 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <svg
                  className="size-5 sm:size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Cards */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Info Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Основная информация
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Производитель *
                  </label>
                  <div className="mt-2 w-full">
                    <CreatableSelect
                      className="w-full"
                      classNamePrefix="rs"
                      placeholder="Выберите или введите..."
                      options={manufacturerOptions}
                      value={
                        formData.manufacturer
                          ? {
                              value: formData.manufacturer,
                              label: formData.manufacturer
                            }
                          : null
                      }
                      onChange={(opt: any) => {
                        updateFormData('manufacturer', opt ? opt.value : '');
                        // reset brand on manufacturer change
                        updateFormData('brand', '');
                      }}
                      isClearable
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Бренд
                  </label>
                  <div className="mt-2 w-full">
                    <CreatableSelect
                      className="w-full"
                      classNamePrefix="rs"
                      placeholder="Выберите или введите..."
                      options={brandOptions}
                      value={
                        formData.brand
                          ? { value: formData.brand, label: formData.brand }
                          : null
                      }
                      onChange={(opt: any) => {
                        const nextBrand = opt ? opt.value : '';
                        updateFormData('brand', nextBrand);
                        // infer wear period from known brand name
                        const inferred =
                          inferWearPeriodTitleForBrand(nextBrand);
                        if (inferred) setWearPeriodByTitle(inferred);
                      }}
                      isClearable
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Сфера *
                  </label>
                  <input
                    type="text"
                    value={formData.sphere}
                    onChange={(e) => updateFormData('sphere', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Например: -4.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Радиус Кривизны
                  </label>
                  <input
                    type="text"
                    value={formData.baseCurveRadius}
                    onChange={(e) =>
                      updateFormData('baseCurveRadius', e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Например: 8.6"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Тип линз
                  </label>
                  <select
                    value={formData.wearPeriodTitle}
                    onChange={(e) => handleWearPeriodChange(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {Object.keys(lensTypeToWearPeriodMap).map((v) => {
                      return (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Период использования (дней)
                  </label>
                  <input
                    type="number"
                    value={formData.usagePeriodDays ?? 0}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') {
                        updateFormData('usagePeriodDays', 0);
                        return;
                      }
                      const parsed = Number(v);
                      updateFormData(
                        'usagePeriodDays',
                        Number.isFinite(parsed) ? Math.max(0, parsed) : 0
                      );
                      if (usageError) setUsageError(null);
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    min="0"
                    max="365"
                  />
                  {usageError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {usageError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Начальный статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      updateFormData('status', next);
                      // if status is set to unopened, reset opened date
                      if (next === 'unopened')
                        updateFormData('openedDate', null);
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="unopened">Не открыты</option>
                    <option value="opened">Открыты</option>
                    <option value="in-use">В использовании</option>
                  </select>
                </div>

                {mode === 'pack' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Количество пар в упаковке
                    </label>
                    <input
                      type="number"
                      value={pairCountInput}
                      onChange={(e) => {
                        setPairCountInput(e.target.value);
                        if (pairCountError) setPairCountError(null);
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      min={1}
                      max={50}
                    />
                    {pairCountError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {pairCountError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dates Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Даты (опционально)
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дата открытия
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="date"
                      value={formData.openedDate || ''}
                      onChange={(e) => {
                        const date = e.target.value || null;
                        updateFormData('openedDate', date);
                        if (date) {
                          if (formData.status === 'unopened') {
                            updateFormData('status', 'opened');
                          }
                        } else {
                          updateFormData('status', 'unopened');
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.openedDate && (
                      <button
                        type="button"
                        onClick={() => {
                          updateFormData('openedDate', null);
                          updateFormData('status', 'unopened');
                        }}
                        className="shrink-0 rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Очистить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <button
              onClick={handleSave}
              disabled={!formData.manufacturer || !formData.sphere}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              <span className="hidden sm:inline">
                {mode === 'pack' ? 'Добавить упаковку' : 'Добавить линзу'}
              </span>
              <span className="sm:hidden">Добавить</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Отменить
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Сбросить форму
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};
