import {
  type InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import Head from "next/head";
import Layout from "~/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { defaultDateRange, fetchData } from "~/utils";
import type { ReturnType } from "./api/voyage/getAll";
import { Button } from "~/components/ui/button";
import { TABLE_DATE_FORMAT } from "~/constants";
import { useFieldArray, useForm } from "react-hook-form";
import { VoyageValidator, type VoyageWithUnitTypes } from "~/models/voyages";
import { type DateRange } from "react-day-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { VoyageSheet } from "~/components/createVoyageSheet";
import { useEffect } from "react";
import { useToast } from "~/components/ui/use-toast";
import { type UnitType } from "@prisma/client";
import { type Option } from "~/components/ui/multiSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export default function Home() {
  const { toast } = useToast();

  const {
    register,
    getValues,
    trigger,
    formState: { errors, isValid },
    control,
  } = useForm<VoyageWithUnitTypes>({ resolver: zodResolver(VoyageValidator) });

  const { replace } = useFieldArray({ control, name: "unitTypes" });

  useEffect(() => {
    register("arrival", { value: defaultDateRange?.to });
    register("departure", { value: defaultDateRange?.from });
    register("unitTypes", { value: [] });
  }, []);

  const onSubmitForm = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await trigger();
    if (isValid) {
      const values = getValues();
      createVoyageMutation.mutate(values);
    }
  };

  const { data: voyages } = useQuery<ReturnType>({
    queryKey: ["voyages"],
    queryFn: () => fetchData("voyage/getAll"),
  });

  const { data: unitTypes } = useQuery<UnitType[]>({
    queryKey: ["unitTypes"],
    queryFn: () => fetchData("unitType/getAll"),
  });

  const onSelectDate = (dateRange: DateRange | undefined) => {
    register("arrival", { value: dateRange?.to });
    register("departure", { value: dateRange?.from });
  };

  const onSelectOption = (options: Option[]) => {
    const findUnitTypes = unitTypes?.reduce(
      (acc, curr) => {
        if (options.some((val) => val.value === curr.name)) {
          acc.push({ id: curr.id });
        }
        return acc;
      },
      [] as { id: string }[],
    );
    replace(findUnitTypes ?? []);
  };

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (voyageId: string) => {
      const response = await fetch(`/api/voyage/delete?id=${voyageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the voyage");
      }
    },
    onError: () => {
      toast({
        description: "Failed to delete voyage",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);
    },
  });

  const createVoyageMutation = useMutation({
    mutationFn: async (voyage: VoyageWithUnitTypes) => {
      const response = await fetch(`/api/voyage/create`, {
        method: "POST",
        body: JSON.stringify(voyage),
      });

      if (!response.ok) {
        throw new Error("Failed to create the voyage");
      }
    },
    onError: () => {
      toast({
        description: "Failed to create voyage",
      });
    },
    onSuccess: async () => {
      toast({
        description: "Voyage created successfully",
      });
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);
    },
  });

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  return (
    <>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-col pt-2">
          <VoyageSheet
            errors={errors}
            onSelectOption={onSelectOption}
            unitTypes={unitTypes}
            onSelectDate={onSelectDate}
            register={register}
            onSubmit={onSubmitForm}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Port of loading</TableHead>
                <TableHead>Port of discharge</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Unit Types</TableHead>
                <TableHead>&nbsp;</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voyages?.map((voyage) => (
                <TableRow key={voyage.id}>
                  <TableCell>
                    {format(
                      new Date(voyage.scheduledDeparture),
                      TABLE_DATE_FORMAT,
                    )}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(voyage.scheduledArrival),
                      TABLE_DATE_FORMAT,
                    )}
                  </TableCell>
                  <TableCell>{voyage.portOfLoading}</TableCell>
                  <TableCell>{voyage.portOfDischarge}</TableCell>
                  <TableCell>{voyage.vessel.name}</TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <TableCell className="cursor-pointer">
                        {voyage.unitTypes.length}
                      </TableCell>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      {voyage.unitTypes.map((unitType, index) => {
                        return (
                          <div key={index} className="py-4">
                            <div>Name: {unitType.name} </div>
                            <div>Default length: {unitType.defaultLength}</div>
                          </div>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                  <TableCell>
                    <Button
                      onClick={() => handleDelete(voyage.id)}
                      variant="outline"
                    >
                      X
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Layout>
    </>
  );
}
