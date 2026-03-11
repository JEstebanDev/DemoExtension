(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});

  Excel.allowedValues = Object.freeze({
    SENIORITY_LEVELS: ["JUNIOR", "SEMI-SENIOR", "SENIOR"],
    LANGUAGES: [
      "Java SE",
      "Java",
      "Python",
      "GO",
      "C# (.NET Framework)",
      "CL",
      "Elixir",
      "RPG/ILE",
      "javascript",
      "Cobol",
      "Dart",
      "Typescript",
      "Fundamento CSS",
      "React",
      "Fundamento HTML",
    ],
    DATABASES: ["SQL Server", "PostgreSQL", "MySQL", "DynamoDB", "DB2", "IBM Cloudant", "MongoDB", "ORACLE", "REDIS"],
    APPLICATIONS: ["Artifactory", "SWIFT", "Amazon EC2"],
    FRAMEWORKS: ["Spring Boot", "ASP MVC", "Express", "Flask", "Pandas", "Scikit-learn", "Angular", "Redux", "Next.js (SSR)", "Django"],
    PLATFORMS: ["Docker", "Kubernetes", "Apache Kafka", "Apache Tomcat", "IIS", "Node js", "Spark", "WAS", "WMQ", "Mockito", "PowerMock"],
    TOOLS: ["SonarQube", "Appium", "Gradle", "GraphQL", "NPM", "Postman", "Rabbit MQ", "RabbitMQ", "Selenium", "Git", "Junit", "Webpack", "UrbanCode", "WebSocket"],
    OTHERS: ["AMQP", "Apache Camel", "OAuth 2.0", "OpenAPI", "Caching", "LocalStorage", "Service Worker", "PWA", "DDD", "SOLID", "JMS", "Sterling"],
  });
})();
