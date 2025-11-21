import { LensEditModal } from '@/features/lens-edit-modal';
import { AddLensModal } from '@/features/add-lens-modal';
import { openModal, closeModal } from '@/app/store/slices/modal-slice/slice';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { MODAL_IDS } from '@/app/store';
import {
  selectAllLenses,
  addLensForUser,
  updateLensForUser,
  deleteLensForUser,
  Lens,
  getRemainingDays
} from '@/app/store/slices/lens-management-slice';
import { selectUser } from '@/app/store/slices/auth-slice/selectors';

import { useState } from 'react';
import { parseDate } from '@/shared/lib';

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const lenses = useAppSelector(selectAllLenses);
  const user = useAppSelector(selectUser);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [addMode, setAddMode] = useState<'single' | 'pack'>('single');

  const handleLensClick = (lens: Lens) => {
    setSelectedLens(lens);
    dispatch(openModal(MODAL_IDS.LENS_EDIT));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
    setSelectedLens(null);
  };

  const handleEdit = (lens: Lens) => {
    if (!user?.id) return;
    dispatch(updateLensForUser({ lens }));
    handleCloseModal();
  };

  const handleDelete = (lens: Lens) => {
    if (!user?.id) return;
    dispatch(deleteLensForUser({ userId: user.id, id: lens.id }));
    handleCloseModal();
  };

  const handleAddLens = () => {
    setAddMode('single');
    dispatch(openModal(MODAL_IDS.ADD_LENS));
  };

  const handleAddPack = () => {
    setAddMode('pack');
    dispatch(openModal(MODAL_IDS.ADD_LENS));
  };

  const handleCloseAddModal = () => {
    dispatch(closeModal());
    setAddMode('single');
  };

  const handleAdd = (lensData: Omit<Lens, 'id'>) => {
    if (!user?.id) return;
    dispatch(addLensForUser({ userId: user.id, lens: lensData }));
    console.log('Add lens:', lensData);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-use':
        return 'text-green-600 dark:text-green-400';
      case 'opened':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'taken-off':
        return 'text-blue-600 dark:text-blue-400';
      case 'unopened':
        return 'text-gray-600 dark:text-gray-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-use':
        return 'В использовании';
      case 'opened':
        return 'Открыты';
      case 'taken-off':
        return 'Сняты';
      case 'unopened':
        return 'Не открыты';
      case 'expired':
        return 'Истекли';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900 dark:text-white">
        Настройки
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Мои линзы
          </h2>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              onClick={handleAddLens}
              className="w-full rounded-lg bg-[var(--color-button-primary)] px-4 py-2 text-sm font-medium text-[var(--color-button-primary-text)] transition-colors hover:brightness-95 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Добавить линзу
            </button>
            <button
              onClick={handleAddPack}
              className="w-full rounded-lg bg-[var(--color-button-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-button-secondary-text)] transition-colors hover:brightness-95 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Добавить упаковку
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {lenses.map((lens) => {
            const remainingDays = getRemainingDays(lens);
            return (
              <div
                key={lens.id}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-gray-900 transition-colors hover:brightness-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-700/50"
                onClick={() => handleLensClick(lens)}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="break-words font-medium text-gray-900 dark:text-white">
                      {lens.manufacturer} {lens.brand} {lens.sphere}
                    </h3>
                    <span className="ml-2 w-fit rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {lens.wearPeriodTitle}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span
                      className={`font-medium ${getStatusColor(lens.status)}`}
                    >
                      {lens.status === 'expired'
                        ? `Истекли ${formatDate(parseDate(lens.discardDate))}`
                        : lens.status === 'opened'
                          ? `Открыты ${formatDate(parseDate(lens.openedDate))}`
                          : getStatusText(lens.status)}
                    </span>

                    {lens.status !== 'expired' &&
                      lens.status !== 'unopened' && (
                        <div className="text-right">
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            Осталось дней: {remainingDays ?? 'N/A'} д.
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LensEditModal
        lens={selectedLens}
        onClose={handleCloseModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddLensModal
        mode={addMode}
        onClose={handleCloseAddModal}
        onAdd={handleAdd}
      />
    </div>
  );
};
