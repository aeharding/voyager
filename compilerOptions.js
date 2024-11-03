export default {
  environment: {
    enableTreatRefLikeIdentifiersAsRefs: true,
  },
  __unstable_donotuse_reportAllBailouts: !!process.env.RCALLBAILS,
};
