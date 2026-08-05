package com.angkor.commerce.common.storage;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class StorageCleanup {


    private final ImageStorageService imageStorageService;

    /**
     * Remove objects once the current transaction commits successfully.
     * If no transaction is active, deletes immediately.
     */

    public void onCommit(String... objectKeys){
        List<String> keys = Arrays.stream(objectKeys).filter(StringUtils::hasText).toList();

        if(keys.isEmpty()){
            return;
        }
        if(!TransactionSynchronizationManager.isSynchronizationActive()){
            imageStorageService.deleteQuietly(keys);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization(){
                    @Override
                    public void afterCommit(){
                        log.debug("Removing {} object(s) after commit", keys.size());
                        imageStorageService.deleteQuietly(keys);
                    }
                }
        );
    }

    /**
     * Remove objects only if the current transaction rolls back.
     * Used after an upload succeeds but before the referencing row is durable.
     */

    public void onRollback(String... objectKeys){
        List<String> keys = Arrays.stream(objectKeys).filter(StringUtils::hasText).toList();
        if(!keys.isEmpty() || TransactionSynchronizationManager.isSynchronizationActive()){
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCompletion(int status) {
                        if(status == STATUS_ROLLED_BACK){
                            log.info("Transaction rolled back — removing {} orphaned object(s)", keys.size());
                            imageStorageService.deleteQuietly(keys);

                        }
                    }
                }
        );

    }





}
