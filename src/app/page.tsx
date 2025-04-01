'use client';
import { PendingOrdersProvider } from "@/context/pendingOrder";
import { CompletedOrderProvider } from "@/context/completedOrder";
import { BotsProvider } from "@/context/bot";
import Content from "./content";


function Home() {
  
  return (
    <CompletedOrderProvider>
      <PendingOrdersProvider>
        <BotsProvider>
          <Content />
        </BotsProvider>
      </PendingOrdersProvider>
    </CompletedOrderProvider>

  );
}
export default Home;