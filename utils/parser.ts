const parseArgs = (argv: string[]) => {
  argv = argv.slice(2);

  const parsedArgs: {
    user: string;
    chain: string;
  } = {
    user: "",
    chain: "",
  };

  argv.forEach((arg, index) => {
    if (arg.startsWith("--user")) {
      parsedArgs.user = argv[index + 1];
    }
    if (arg.startsWith("--chain")) {
      parsedArgs.chain = argv[index + 1];
    }
  });

  return parsedArgs;
};

export const Parser = {
  parseArgs,
};
