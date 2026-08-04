"use client";

import { Icon } from "@iconify/react";
import { useId, useRef, useState, type DragEvent } from "react";

export type DropzoneInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mergeFiles(
  current: File[],
  incoming: File[],
  multiple: boolean,
  maxFiles: number,
): File[] {
  if (!multiple) return incoming.slice(0, 1);
  const map = new Map<string, File>();
  [...current, ...incoming].forEach((file) => {
    map.set(`${file.name}-${file.size}-${file.lastModified}`, file);
  });
  return Array.from(map.values()).slice(0, maxFiles);
}

export function DropzoneInput({
  id,
  label,
  helperText,
  error,
  value = [],
  onChange,
  accept,
  multiple = true,
  maxFiles = 10,
  disabled = false,
  placeholder = "Drag & drop files here, or click to browse",
  className = "",
  containerClassName = "",
}: Readonly<DropzoneInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  let describedBy: string | undefined;
  if (error) {
    describedBy = `${inputId}-error`;
  } else if (helperText) {
    describedBy = `${inputId}-helper`;
  }

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${inputId}-error`} className="text6 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${inputId}-helper`} className="text6 text-gray">
        {helperText}
      </p>
    );
  }

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    onChange?.(mergeFiles(value, incoming, multiple, maxFiles));
  };

  const removeFile = (target: File) => {
    onChange?.(
      value.filter(
        (file) =>
          !(
            file.name === target.name &&
            file.size === target.size &&
            file.lastModified === target.lastModified
          ),
      ),
    );
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  };

  let dropzoneBorder = "border-darkest/20";
  if (error) {
    dropzoneBorder = "border-red";
  } else if (dragging) {
    dropzoneBorder = "border-blue-normal";
  }

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`.trim()}>
      {label ? (
        <label htmlFor={inputId} className="text5 font-semibold text-darkest">
          {label}
        </label>
      ) : null}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-[10px] border border-dashed bg-white p-6 text-center shadow-xl transition-colors ${dropzoneBorder} ${
          dragging ? "bg-blue-lightest/40" : ""
        } ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`.trim()}
      >
        <Icon
          icon="mdi:cloud-upload-outline"
          width={28}
          height={28}
          className="mx-auto text-blue-normal"
          aria-hidden
        />
        <p className="mt-2 text5 text-darkest">{placeholder}</p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-lightest px-3 py-1.5 text5 font-semibold text-blue-deep transition-colors hover:bg-blue-light disabled:cursor-not-allowed"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={describedBy}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {value.length > 0 ? (
        <ul className="space-y-1.5">
          {value.map((file) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-darkest/10 bg-lightgray px-3 py-2 text5"
            >
              <span className="min-w-0 truncate text-darkest">
                {file.name}{" "}
                <span className="text-gray">({formatFileSize(file.size)})</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(file)}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray transition-colors hover:bg-white hover:text-darkest disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:close" width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {fieldMessage}
    </div>
  );
}
