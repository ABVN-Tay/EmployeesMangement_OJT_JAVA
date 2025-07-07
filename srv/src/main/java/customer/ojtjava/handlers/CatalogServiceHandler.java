package customer.ojtjava.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.catalogservice.CatalogService_;

@Component
@ServiceName(CatalogService_.CDS_NAME)
public class CatalogServiceHandler implements EventHandler {
	 private static final Logger logger = LoggerFactory.getLogger(CatalogServiceHandler.class);
	 private PersistenceService db;

    public CatalogServiceHandler(PersistenceService db) {
        this.db = db;
    }

    
}