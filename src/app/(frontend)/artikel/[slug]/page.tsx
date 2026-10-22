import HalamanArtikel, {
  generateMetadata as generateArtikelMetadata,
  generateStaticParams as generateArtikelStaticParams,
} from "../../tulisan-pajak/[slug]/page";

export const generateStaticParams = generateArtikelStaticParams;
export const generateMetadata = generateArtikelMetadata;

export default HalamanArtikel;
