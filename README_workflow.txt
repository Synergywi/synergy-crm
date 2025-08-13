This repository includes a fixed GitHub Actions workflow for Azure Static Web Apps.
- The workflow lives at .github/workflows/azure-static-web-apps.yml
- It skips Oryx builds for a plain static site and avoids the "Invalid workflow file" error.
- If your Static Web App uses a different environment/secret name, update:
    secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_STONE_05D05E710
  in both places in the YAML.
