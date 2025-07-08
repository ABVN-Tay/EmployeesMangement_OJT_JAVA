package customer.ojtjava.handlers;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.events.Event.ID;

import com.sap.cds.Result;
import com.sap.cds.ql.Select;
import com.sap.cds.reflect.CdsModel;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.services.request.UserInfo;

import cds.gen.catalogservice.CalculateSalaryContext;
import cds.gen.catalogservice.CatalogService_;
import cds.gen.catalogservice.GetCurrentUserContext;
import cds.gen.catalogservice.Roles;
import cds.gen.employees_management.db.Roles_;

@Component
@ServiceName(CatalogService_.CDS_NAME)
public class CatalogServiceHandler implements EventHandler {
	 private static final Logger logger = LoggerFactory.getLogger(CatalogServiceHandler.class);
	 private PersistenceService db;

    public CatalogServiceHandler(PersistenceService db) {
        this.db = db;
    }

    @On(event = "calculateSalary")
    public void calculateSalary(CalculateSalaryContext context) throws BadRequestException {
        // CdsModel model = context.getModel();
        // model.
        String  roleID = context.getRolesId();
        LocalDate hireDate = context.getHireDate();

        if (roleID == null || hireDate == null) {
            throw new BadRequestException("Missing parameter.");
        }
        Result roleResult = db.run( Select.from(Roles_.class)
                                                    .where(role -> role.ID().eq(roleID)));          

        if (roleResult == null) {
            throw new Error("Role not found " + roleID.toString());
        }

        Roles role = roleResult.single(Roles.class);
        BigDecimal baseSalary = role.getBaseSalary();

        
        long yearsOfExp = ChronoUnit.YEARS.between(hireDate, LocalDate.now());
        BigDecimal yearlyBonus = BigDecimal.valueOf(yearsOfExp * 1000);
        BigDecimal totalSalary = baseSalary.add(yearlyBonus);
        context.setResult(totalSalary);
    };
    @On(event = "getCurrentUser")
    public void getCurrentUser(GetCurrentUserContext context) throws BadRequestException {
        Map<String, Object> userDetails = new HashMap<>();
        String role;
        UserInfo userInfo = context.getUserInfo();
        // boolean hasAdminRole = userInfo.getRoles() != null && userInfo.getRoles().contains("Admin");
        boolean hasAdminRole = userInfo.hasRole("Admin");
        if (hasAdminRole == true) {
            role = "Admin";
        }else{
            role = "Viewer";
        }

        userDetails.put(GetCurrentUserContext.ReturnType.ID, userInfo.getId());
        userDetails.put(GetCurrentUserContext.ReturnType.EMAIL, userInfo.getName());
        userDetails.put(GetCurrentUserContext.ReturnType.ROLES, role);


        GetCurrentUserContext.ReturnType result = GetCurrentUserContext.ReturnType.of(userDetails);
        logger.info("Returning user information: {}", result);
        context.setResult(result);


    }

    
}