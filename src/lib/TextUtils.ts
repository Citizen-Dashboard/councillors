import slugify from "slugify";

const slugifyOptions = { lower: true };

export const toSlug = (input: string) => {
  if (!input.trim()) throw new Error(`Cannot sluggify empty input`);
  const output = slugify(input, slugifyOptions);
  if (!output) throw new Error(`Sluggifying "${input}" produced "${output}"`);
  return output;
};
