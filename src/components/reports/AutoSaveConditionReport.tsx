import {QUERY_KEYS} from '@api/contants/constants';
import {useSaveConditionReport} from '@api/hooks/HooksReportServices';
import {ConditionReportType} from '@api/types/Inventory';
import {ConditionReportSchemaType} from '@generalTypes/schemas';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import useInventoryStore from '@store/inventory';
import useTopSheetStore from '@store/topsheet';
import {useEffect, useRef, useState} from 'react';
import {useWatch} from 'react-hook-form';

type Props = {
  initialConditionReport?: ConditionReportType | null;
  currentItem?: {
    id: number | undefined;
    clientRef: string | undefined;
    clientInv: string | number | undefined;
  } | null;
};
export const AutoSaveConditionReport = ({
  initialConditionReport,
  currentItem,
}: Props) => {
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {topSheetFilter, inventoryFilter, orderFilter, orderType} =
    useInventoryStore();

  const [localInitialized, setLocalInitialized] = useState(false);
  const formData = useWatch<ConditionReportSchemaType>();
  // @ts-ignore
  const idTimeOut = useRef<NodeJS.Timeout | null>(null);
  const firstRun = useRef(true); // 👈 Esto evita la ejecución inicial

  const {mutateAsync: saveConditionAsync} = useSaveConditionReport();

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.RESUME_CONDITION_REPORT, {idJob: jobDetail?.id}],
    [QUERY_KEYS.TASK_COUNT, {idJob: jobDetail?.id}],
    [QUERY_KEYS.INVENTORY_ITEM_DETAIL, {id: currentItem?.id!}],
  ]);

  const {hardRefreshMany} = useRefreshIndicator([
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: jobDetail!.id,
        filter: topSheetFilter,
        orderFilter,
        orderType,
      },
    ],
    [
      QUERY_KEYS.JOB_INVENTORY,
      {
        idJob: jobDetail!.id,
        filter: inventoryFilter,
        orderFilter,
        orderType,
      },
    ],
  ]);

  useEffect(() => {
    // Evitar que se ejecute en el primer render
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    // Si aún no está listo para autosave, no hacemos nada
    if (!currentItem?.id) return;

    // Limpiar timeout anterior si existe
    if (idTimeOut.current) {
      clearTimeout(idTimeOut.current);
    }

    // Programar nuevo autosave
    idTimeOut.current = setTimeout(() => {
      if (!localInitialized) {
        setLocalInitialized(true);
      } else {
        // Aquí va el autosave real
        saveConditionAsync({
          id: initialConditionReport?.id ?? null,
          idJob: jobDetail?.id!,
          idInventory: currentItem?.id!,
          partial: true,
          artistName: formData.artistName?.title,
          artTypeName: formData.artTypeName?.title,

          placeOfExam: formData.placeOfExam,
          conditionArtWork: formData.conditionArtWork,
          edition: formData.edition,
          frame_height: formData.frame_height,
          frame_length: formData.frame_length,
          frame_width: formData.frame_width,
          labeled: formData.labeled,
          mediumName: formData.mediumName,
          otherText: formData.packing_details_other,
          signature: formData.signature,
          title: formData.title,
          year: formData.year,

          packed_height: formData.packed_height,
          packed_length: formData.packed_length,
          packed_width: formData.packed_width,
          un_packed_height: formData.un_packed_height,
          un_packed_length: formData.un_packed_length,
          un_packed_width: formData.un_packed_width,
          unpacked_weight: formData.unpacked_weight,
          weight: formData.weight,

          // @ts-ignore
          frameFixture: formData.frameFixture?.map((x) => x.title),
          // @ts-ignore
          hangingSystem: formData.hangingSystem?.map((x) => x.title),
          // @ts-ignore
          packingDetail: formData.packingDetail?.map((x) => x.title),
        })
          .then((d) => {
            if (d) {
              refetchAll();
              hardRefreshMany();
            }
          })
          .catch(() => {});
      }
    }, 3000);

    // Limpiar el timeout si cambian las dependencias o se desmonta
    return () => {
      if (idTimeOut.current) {
        clearTimeout(idTimeOut.current);
      }
    };
  }, [
    formData,
    currentItem?.id,
    refetchAll,
    setLocalInitialized,
    saveConditionAsync,
    hardRefreshMany,
  ]);

  return null;
};
