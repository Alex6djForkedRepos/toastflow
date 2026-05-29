declare module "vue-snowfall" {
  export function useSnowfall(options: { container: string }): {
    startSnowflakes: () => void;
    stopSnowflakes: () => void;
  };
}
