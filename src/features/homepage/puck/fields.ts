import type { Field } from "@puckeditor/core";

export const textField = (label: string): Field => ({
  type: "text",
  label,
});

export const textareaField = (label: string): Field => ({
  type: "textarea",
  label,
});

export const numberField = (label: string, min = 0, max = 100): Field => ({
  type: "number",
  label,
  min,
  max,
});

export const selectField = (
  label: string,
  options: { label: string; value: string }[],
): Field => ({
  type: "select",
  label,
  options,
});
