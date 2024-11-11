export default {
  environment: {
    enableTreatRefLikeIdentifiersAsRefs: true,
  },
  // eslint-disable-next-line no-undef
  reportableLevels: !process.env.RCALL
    ? undefined
    : // https://github.com/facebook/react/blob/5c56b87/compiler/packages/babel-plugin-react-compiler/src/CompilerError.ts#L11-L39
      new Set([
        "InvalidJS",
        "InvalidReact",
        "InvalidConfig",
        "CannotPreserveMemoization",
        "Todo",
        "Invariant",
      ]),
};
