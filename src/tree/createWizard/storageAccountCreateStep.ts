/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { StorageManagementClient, StorageManagementModels } from '@azure/arm-storage';
import { AzureWizardExecuteStep, INewStorageAccountDefaults, IStorageAccountWizardContext } from 'vscode-azureextensionui';
import { NotificationProgress } from '../../constants';
import { ext } from '../../extensionVariables';
import { createStorageClient } from '../../utils/azureClients';

export class StorageAccountCreateStep<T extends IStorageAccountWizardContext> extends AzureWizardExecuteStep<T> implements StorageAccountCreateStep<T> {
    public priority: number = 130;

    private readonly _defaults: INewStorageAccountDefaults;

    public constructor(defaults: INewStorageAccountDefaults) {
        super();
        this._defaults = defaults;
    }

    public async execute(wizardContext: T, progress: NotificationProgress): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newLocation: string = wizardContext.location!.name!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newName: string = wizardContext.newStorageAccountName!;
        const newSkuName: StorageManagementModels.SkuName = <StorageManagementModels.SkuName>`${this._defaults.performance}_${this._defaults.replication}`;
        const creatingStorageAccount: string = `Creating storage account "${newName}" in location "${newLocation}" with sku "${newSkuName}"...`;
        ext.outputChannel.appendLog(creatingStorageAccount);
        progress.report({ message: creatingStorageAccount });
        const storageClient: StorageManagementClient = await createStorageClient(wizardContext);
        wizardContext.storageAccount = await storageClient.storageAccounts.create(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            wizardContext.resourceGroup!.name!,
            newName,
            {
                sku: { name: newSkuName },
                kind: this._defaults.kind,
                location: newLocation,
                enableHttpsTrafficOnly: true
            }
        );
        const createdStorageAccount: string = `Successfully created storage account "${newName}".`;
        ext.outputChannel.appendLog(createdStorageAccount);
    }

    public shouldExecute(wizardContext: T): boolean {
        return !wizardContext.storageAccount;
    }
}
